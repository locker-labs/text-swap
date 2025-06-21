import { Check } from "lucide-react";

export default function StepIndicator({
    step,
    activeStep,
    text
} : {
    step: number;
    activeStep: number;
    text: string;
}) {

    const borderClass = activeStep === step ? 'border-[#4F46E5]'
    : activeStep < step ? 'border-[#9DA4B1]'
    : 'border-[#4F46E5]';

    const textClass = activeStep === step ? 'text-[#4F46E5]'
    : activeStep < step ? 'text-[#9DA4B1]'
    : 'text-[#4F46E5]';

    const backgroundClass = activeStep === step ? 'bg-[#ffffff] outline-[4px] outline-[#D6EAFD]'
    : step > activeStep ? 'bg-[#ffffff]'
    : 'bg-[#4F46E5]';

    const centerElement = activeStep <= step ? step : <Check size={20} color="#F0FDF4" />;

    return <div className="">
        <div className={`mb-[6px] ${backgroundClass} mx-auto w-[40px] rounded-full aspect-square border-[2px] ${borderClass} flex items-center justify-center`}>
            <p className={`${textClass} text-[20px] font-medium font-[Roboto]`}>{centerElement}</p>
        </div>
        <p className={`font-medium text-[14px] font-[Roboto] text-center ${textClass}`}>{text}</p>
    </div>    
}