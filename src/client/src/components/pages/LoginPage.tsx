import { Button, Card, toast } from "@heroui/react";
import { useForm } from "@tanstack/react-form";
import { useNavigate } from "@tanstack/react-router";
import { useLogin } from "../../hooks/useAuth";
import { getApiErrorMessage } from "../../lib/apiError";
import { loginSchema, type TLoginForm } from "../../validators";
import { TextInput } from "../formInputs";

export function LoginPage() {
  const navigate = useNavigate();
  const login = useLogin();

  const form = useForm({
    defaultValues: { username: "", password: "" } as TLoginForm,
    validators: { onChange: loginSchema },
    onSubmit: async ({ value }) => {
      try {
        await login.mutateAsync(value);
        navigate({ to: "/" });
      } catch (error) {
        toast.danger(getApiErrorMessage(error, "Invalid credentials"));
      }
    },
  });

  return (
    <div className="grid min-h-screen place-items-center bg-background p-4">
      <Card className="w-full max-w-sm">
        <Card.Header className="flex flex-col items-center gap-2 pt-6">
          <div className="grid size-12 place-items-center rounded-xl bg-accent text-lg font-bold text-accent-foreground">
            GP
          </div>
          <Card.Title>Admin Panel</Card.Title>
          <Card.Description>Sign in to continue</Card.Description>
        </Card.Header>
        <Card.Content className="p-6">
          <form
            className="flex flex-col gap-4"
            onSubmit={(event) => {
              event.preventDefault();
              event.stopPropagation();
              void form.handleSubmit();
            }}
          >
            <form.Field name="username">
              {(field) => (
                <TextInput
                  field={field}
                  label="Username"
                  isRequired
                  autoComplete="username"
                />
              )}
            </form.Field>
            <form.Field name="password">
              {(field) => (
                <TextInput
                  field={field}
                  label="Password"
                  type="password"
                  isRequired
                  autoComplete="current-password"
                />
              )}
            </form.Field>
            <form.Subscribe selector={(state) => state.isSubmitting}>
              {(isSubmitting) => (
                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  isDisabled={isSubmitting}
                >
                  {isSubmitting ? "Signing in…" : "Sign in"}
                </Button>
              )}
            </form.Subscribe>
          </form>
        </Card.Content>
      </Card>
    </div>
  );
}
