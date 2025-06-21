import StepIndicator from "./StepIndicator"
import { useSteps } from "@/providers/StepProvider"

export default function StepIndicators() {
    const { activeStep } = useSteps();

    const steps = [
        {
            step: 1,
            text: 'Install Metamask Flask'
        },
        {
            step: 2,
            text: 'Connect Twitter'
        },
        {
            step: 3,
            text: 'Grant Permission'
        },
        {
            step: 4,
            text: 'Tweet'
        },
    ]

    return <div className="mt-[28px] sm:mt-[72px] mb-[28px] md:mb-[40px] w-full grid grid-cols-4 gap-4">
        {steps.map((s, i) => <StepIndicator key={i} step={s.step} text={s.text} activeStep={activeStep} />)}
    </div>
}