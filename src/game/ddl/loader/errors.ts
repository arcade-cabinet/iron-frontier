/**
 * DDL error types for load and validation failures.
 *
 * @module game/ddl/loader/errors
 */

// ============================================================================
// ERROR TYPES
// ============================================================================

export class DDLLoadError extends Error {
  constructor(
    message: string,
    public readonly levelId: string,
    public readonly cause?: unknown
  ) {
    super(message);
    this.name = 'DDLLoadError';
  }
}

export class DDLValidationError extends Error {
  constructor(
    message: string,
    public readonly levelId: string,
    public readonly errors: unknown[]
  ) {
    super(message);
    this.name = 'DDLValidationError';
  }
}
