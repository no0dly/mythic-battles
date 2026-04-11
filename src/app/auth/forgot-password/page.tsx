"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ForgotPasswordFormValues, forgotPasswordSchema } from "./constants";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const supabase = createClient();

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const handleSubmit = async (values: ForgotPasswordFormValues) => {
    const { error } = await supabase.auth.resetPasswordForEmail(values.email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/auth/update-password`,
    });

    if (error) {
      form.setError("email", { message: error.message });
    }
  };

  const isSuccess =
    form.formState.isSubmitSuccessful && !form.formState.errors.email;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg">
        <div>
          <h2 className="text-center text-3xl font-bold text-gray-900 dark:text-white">
            Forgot password
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Enter your email and we will send you a reset link.
          </p>
        </div>

        {isSuccess ? (
          <div className="p-3 rounded-lg text-sm bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 text-center">
            Check your email for a password reset link!
          </div>
        ) : (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="you@example.com"
                        disabled={form.formState.isSubmitting}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? "Sending..." : "Send reset link"}
              </Button>
            </form>
          </Form>
        )}

        <p className="text-center text-sm text-gray-600 dark:text-gray-400">
          <Link
            href="/auth/login"
            className="text-blue-600 hover:underline dark:text-blue-400"
          >
            Back to login
          </Link>
        </p>
      </div>
    </div>
  );
}
