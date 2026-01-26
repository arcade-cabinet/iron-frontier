import { Page, Locator, expect } from '@playwright/test';

/**
 * Page Object for Iron Frontier Unity WebGL game
 * Handles Unity-specific interactions, waits, and state management
 */
export class GamePage {
  readonly page: Page;
  readonly canvas: Locator;
  readonly loadingBar: Locator;
  readonly loadingProgress: Locator;

  constructor(page: Page) {
    this.page = page;
    this.canvas = page.locator('#unity-canvas, canvas').first();
    this.loadingBar = page.locator('#unity-loading-bar, .unity-loading-bar, [class*="loading"]').first();
    this.loadingProgress = page.locator('#unity-progress-bar, .unity-progress-bar, [class*="progress"]').first();
  }

  /**
   * Navigate to the game
   */
  async goto() {
    await this.page.goto('/');
  }

  /**
   * Wait for Unity WebGL to fully load and initialize
   */
  async waitForGameReady(timeout = 120000) {
    console.log('Waiting for Unity WebGL to load...');

    // First wait for canvas to exist
    await this.canvas.waitFor({ state: 'attached', timeout });

    // Wait for Unity to initialize (check for Unity globals)
    await this.page.waitForFunction(
      () => {
        const win = window as any;
        // Check various Unity ready indicators
        const unityInstance = win.unityInstance || win.gameInstance;
        const Module = win.Module;

        if (unityInstance && typeof unityInstance.SendMessage === 'function') {
          return true;
        }
        if (Module && Module.calledRun === true) {
          return true;
        }
        // Also check for Unity logo hiding (loading complete)
        const loadingBar = document.querySelector('#unity-loading-bar, .unity-loading-bar');
        if (loadingBar && getComputedStyle(loadingBar).display === 'none') {
          return true;
        }
        return false;
      },
      { timeout }
    ).catch((e) => {
      console.log('Unity globals check timed out, using fallback detection:', e.message);
    });

    // Ensure loading bar is gone or hidden
    await this.loadingBar.waitFor({ state: 'hidden', timeout: 60000 }).catch(() => {
      console.log('Loading bar still visible, continuing anyway');
    });

    // Extra wait for game initialization
    await this.page.waitForTimeout(3000);

    console.log('Unity WebGL loaded');
  }

  /**
   * Wait for main menu to appear
   */
  async waitForMainMenu(timeout = 60000) {
    console.log('Waiting for main menu...');
    await this.waitForText('New Game', timeout);
    console.log('Main menu visible');
  }

  /**
   * Wait for text to appear in the game (DOM or canvas)
   */
  async waitForText(text: string, timeout = 30000): Promise<boolean> {
    try {
      // Try various DOM selectors that Unity UI Toolkit might create
      const selectors = [
        `text="${text}"`,
        `*:has-text("${text}")`,
        `[data-text="${text}"]`,
        `button:has-text("${text}")`,
        `.unity-button:has-text("${text}")`,
        `.unity-text-element:has-text("${text}")`,
      ];

      for (const selector of selectors) {
        try {
          const element = this.page.locator(selector).first();
          await element.waitFor({ state: 'visible', timeout: timeout / selectors.length });
          if (await element.isVisible()) {
            return true;
          }
        } catch {
          continue;
        }
      }

      return false;
    } catch {
      return false;
    }
  }

  /**
   * Check if text/element exists and is visible
   */
  async hasText(text: string, timeout = 5000): Promise<boolean> {
    try {
      const element = this.page.locator(`text="${text}"`).first();
      return await element.isVisible({ timeout }).catch(() => false);
    } catch {
      return false;
    }
  }

  /**
   * Get a button by text
   */
  getButton(text: string): Locator {
    return this.page.locator(`text="${text}"`).first();
  }

  /**
   * Click a button/element by text
   */
  async clickButton(text: string, options?: { timeout?: number; force?: boolean }) {
    const timeout = options?.timeout ?? 10000;
    const force = options?.force ?? false;

    const button = this.getButton(text);
    await button.waitFor({ state: 'visible', timeout });
    await button.click({ force });
    await this.page.waitForTimeout(500);
  }

  /**
   * Try to click one of several possible buttons
   */
  async tryClickButtons(texts: string[]): Promise<boolean> {
    for (const text of texts) {
      try {
        const element = this.page.locator(`text="${text}"`).first();
        if (await element.isVisible({ timeout: 2000 })) {
          await element.click();
          await this.page.waitForTimeout(500);
          return true;
        }
      } catch {
        continue;
      }
    }
    return false;
  }

  /**
   * Type text into an input field
   */
  async typeText(text: string) {
    // Look for input fields (Unity UI Toolkit creates DOM inputs)
    const inputSelectors = [
      'input[type="text"]',
      'input:not([type])',
      '.unity-text-field__input',
      '.unity-base-text-field__input',
      '[contenteditable="true"]',
    ];

    for (const selector of inputSelectors) {
      try {
        const input = this.page.locator(selector).first();
        if (await input.isVisible({ timeout: 2000 })) {
          await input.fill(text);
          await this.page.waitForTimeout(300);
          return;
        }
      } catch {
        continue;
      }
    }

    // Fallback: click canvas and type
    await this.canvas.click();
    await this.page.keyboard.type(text, { delay: 50 });
    await this.page.waitForTimeout(300);
  }

  /**
   * Press a key
   */
  async pressKey(key: string) {
    await this.page.keyboard.press(key);
    await this.page.waitForTimeout(200);
  }

  /**
   * Get game title from page
   */
  async getGameTitle(): Promise<string> {
    // Check page title
    const pageTitle = await this.page.title();
    if (pageTitle.includes('Iron Frontier')) {
      return pageTitle;
    }

    // Check for title in DOM
    if (await this.hasText('Iron Frontier')) {
      return 'Iron Frontier';
    }

    // Check meta tags
    const ogTitle = await this.page.locator('meta[property="og:title"]').getAttribute('content');
    if (ogTitle) return ogTitle;

    return pageTitle;
  }

  /**
   * Send message to Unity (for testing hooks)
   */
  async sendToUnity(gameObjectName: string, methodName: string, parameter: string = '') {
    await this.page.evaluate(
      ({ obj, method, param }) => {
        const win = window as any;
        const unityInstance = win.unityInstance || win.gameInstance;
        if (unityInstance && typeof unityInstance.SendMessage === 'function') {
          unityInstance.SendMessage(obj, method, param);
          return true;
        }
        return false;
      },
      { obj: gameObjectName, method: methodName, param: parameter }
    );
    await this.page.waitForTimeout(500);
  }

  /**
   * Click at specific canvas coordinates
   */
  async clickCanvas(x: number, y: number) {
    const box = await this.canvas.boundingBox();
    if (box) {
      await this.page.mouse.click(box.x + x, box.y + y);
      await this.page.waitForTimeout(300);
    }
  }

  /**
   * Click at relative canvas position (0-1 range)
   */
  async clickCanvasRelative(xRatio: number, yRatio: number) {
    const box = await this.canvas.boundingBox();
    if (box) {
      const x = box.x + box.width * xRatio;
      const y = box.y + box.height * yRatio;
      await this.page.mouse.click(x, y);
      await this.page.waitForTimeout(300);
    }
  }

  /**
   * Take a named screenshot
   */
  async screenshot(name: string) {
    await this.page.screenshot({
      path: `test-results/screenshots/${name}.png`,
      fullPage: false,
    });
  }

  /**
   * Wait for animation/transition to complete
   */
  async waitForAnimation(duration = 1000) {
    await this.page.waitForTimeout(duration);
  }

  /**
   * Check if game is in loading state
   */
  async isLoading(): Promise<boolean> {
    return await this.loadingBar.isVisible().catch(() => false);
  }

  /**
   * Get WebGL context info (for debugging)
   */
  async getWebGLInfo(): Promise<any> {
    return await this.page.evaluate(() => {
      const canvas = document.querySelector('canvas');
      if (!canvas) return null;

      const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
      if (!gl) return { error: 'WebGL not available' };

      return {
        vendor: gl.getParameter(gl.VENDOR),
        renderer: gl.getParameter(gl.RENDERER),
        version: gl.getParameter(gl.VERSION),
        shadingLanguageVersion: gl.getParameter(gl.SHADING_LANGUAGE_VERSION),
      };
    });
  }
}
