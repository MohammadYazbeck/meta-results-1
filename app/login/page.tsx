import { adminLoginAction } from "@/app/actions/admin-auth";
import {
  eyebrowClassName,
  inputClassName,
  mutedTextClassName,
  panelClassName,
  primaryButtonClassName,
} from "@/components/ui/class-names";
import { cn } from "@/lib/utils";

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function getSingleValue(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

function getErrorMessage(errorCode?: string) {
  switch (errorCode) {
    case "invalid":
      return "Invalid username or password.";
    case "config":
      return "Admin credentials are missing in environment variables.";
    default:
      return "";
  }
}

export default async function LoginPage({ searchParams }: PageProps) {
  const params = (await searchParams) ?? {};
  const errorMessage = getErrorMessage(getSingleValue(params.error));

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-8">
      <section
        className={cn(panelClassName, "w-full max-w-[460px] p-6 sm:p-8")}
      >
        <p className={eyebrowClassName}>دخول المدير</p>
        <h1 className="font-display text-[clamp(2rem,6vw,3.2rem)] leading-[1.02] text-ink">
          تسجيل الدخول إلى لوحة التحكم
        </h1>
        <p className={mutedTextClassName}>
          هذه اللوحة مخصصة لحساب المدير المحدد داخل متغيرات البيئة.
        </p>

        <form action={adminLoginAction} className="mt-7 grid gap-3">
          <label className="text-sm font-medium text-muted" htmlFor="username">
            اسم المستخدم
          </label>
          <input
            className={inputClassName}
            id="username"
            name="username"
            type="text"
          />

          <label className="text-sm font-medium text-muted" htmlFor="password">
            كلمة المرور
          </label>
          <input
            className={inputClassName}
            id="password"
            name="password"
            type="password"
          />

          <button className={primaryButtonClassName} type="submit">
            دخول
          </button>
        </form>

        {errorMessage ? (
          <p className="mt-4 text-sm font-bold text-[#b42318]">
            {errorMessage}
          </p>
        ) : null}
      </section>
    </main>
  );
}
