/**
 * @iron-frontier/ui/web
 *
 * Web-specific UI components built with Tailwind CSS and CVA.
 * These components are designed for React DOM (browser) usage.
 */

// Re-export utilities
export { cn } from '../primitives/utils';
// Core components
export { Button, buttonVariants, type WebButtonProps } from './Button';
export {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  cardVariants,
  type WebCardProps,
} from './Card';
export { Input, inputVariants, type WebInputProps } from './Input';
export {
  Modal,
  ModalHeader,
  modalContentVariants,
  overlayVariants,
  Sheet,
  sheetContentVariants,
  type WebModalProps,
  type WebSheetProps,
} from './Modal';
export {
  LoadingOverlay,
  Spinner,
  spinnerVariants,
  type WebSpinnerProps,
} from './Spinner';
export { Text, textVariants, type WebTextProps } from './Text';
