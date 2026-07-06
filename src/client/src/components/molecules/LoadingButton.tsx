import { Button } from "@heroui/react";
import { Loader2Icon } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";

// Children are narrowed to plain nodes (no render function) so the spinner
// can be prepended to them.
type TLoadingButtonProps = Omit<ComponentProps<typeof Button>, "children"> & {
  /** Shows an inline spinner and blocks presses while the action runs. */
  isLoading?: boolean;
  children?: ReactNode;
};

/**
 * Button with a built-in loading spinner for in-flight actions (form
 * submissions, deletions). The spinner is prepended to the label so the
 * button keeps its size and text while working.
 */
export function LoadingButton({
  isLoading = false,
  isDisabled,
  children,
  ...props
}: TLoadingButtonProps) {
  return (
    <Button {...props} isDisabled={isLoading || isDisabled}>
      {isLoading ? (
        <Loader2Icon className="size-4 animate-spin" aria-hidden />
      ) : null}
      {children}
    </Button>
  );
}
