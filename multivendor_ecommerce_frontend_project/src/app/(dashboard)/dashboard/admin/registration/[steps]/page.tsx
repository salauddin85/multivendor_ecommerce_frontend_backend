import OnboardingStep1 from "@/components/registration/OnBoardStep1";
import OnboardingStep2 from "@/components/registration/OnBoardStep2";
import OnboardingStep3 from "@/components/registration/OnBoardStep3";
import { redirect } from "next/navigation";

type StepType = "email" | "otp" | "add";

interface OnboardingPageProps {
  params: Promise<{
    steps: string;
  }>;
}

const validSteps: StepType[] = ["email", "otp", "add"];

export default async function OnboardingPage({ params }: OnboardingPageProps) {
  const { steps } = await params;
  
  if (!validSteps.includes(steps as StepType)) {
    redirect("/dashboard/admin/registration/email");
  }

  return (
    <div>
      {steps === "email" && <OnboardingStep1 />}
      {steps === "otp" && <OnboardingStep2 />}
      {steps === "add" && <OnboardingStep3 />}
    </div>
  );
}