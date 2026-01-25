/**
 * @iron-frontier/ui/web
 *
 * Web-specific UI components built with Tailwind CSS and CVA.
 * These components are designed for React DOM (browser) usage.
 */

// Core components
export { Button, buttonVariants, type WebButtonProps } from './Button';
export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  cardVariants,
  type WebCardProps,
} from './Card';
export { Text, textVariants, type WebTextProps } from './Text';
export { Input, inputVariants, type WebInputProps } from './Input';
export {
  Modal,
  Sheet,
  ModalHeader,
  overlayVariants,
  modalContentVariants,
  sheetContentVariants,
  type WebModalProps,
  type WebSheetProps,
} from './Modal';
export {
  Spinner,
  LoadingOverlay,
  spinnerVariants,
  type WebSpinnerProps,
} from './Spinner';

// Re-export utilities
export { cn } from '../primitives/utils';
