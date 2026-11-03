"use client";

import { MinusIcon } from "lucide-react";
import * as React from "react";
import { cn } from "../lib/utils";

interface SlotData {
	char?: string;
	isActive?: boolean;
	hasFakeCaret?: boolean;
}

interface OTPContextValue {
	slots: SlotData[];
	isFocused: boolean;
}

const OTPInputContext = React.createContext<OTPContextValue | null>(null);

export interface InputOTPProps
	extends Omit<React.ComponentProps<"input">, "onChange"> {
	maxLength?: number;
	value?: string;
	onChange?: (value: string) => void;
	onComplete?: (value: string) => void;
	containerClassName?: string;
}

function InputOTP({
	className,
	containerClassName,
	maxLength = 6,
	value = "",
	onChange,
	onComplete,
	disabled,
	children,
	...props
}: InputOTPProps) {
	const inputRef = React.useRef<HTMLInputElement>(null);
	const [isFocused, setIsFocused] = React.useState(false);

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const val = e.target.value.slice(0, maxLength);
		onChange?.(val);
		if (val.length === maxLength) {
			onComplete?.(val);
		}
	};

	const focusedIndex = Math.min(value.length, maxLength - 1);

	const slots: SlotData[] = React.useMemo(() => {
		const list: SlotData[] = [];
		for (let i = 0; i < maxLength; i++) {
			const char = value[i];
			const isActive = isFocused && (i === focusedIndex || (i === maxLength - 1 && value.length === maxLength));
			list.push({
				char,
				isActive,
				hasFakeCaret: isActive && !char,
			});
		}
		return list;
	}, [value, maxLength, isFocused, focusedIndex]);

	return (
		<OTPInputContext.Provider value={{ slots, isFocused }}>
			<div
				data-slot="input-otp"
				onClick={() => inputRef.current?.focus()}
				className={cn(
					"cn-input-otp relative flex items-center select-none cursor-text",
					disabled && "cursor-not-allowed opacity-50",
					containerClassName,
				)}
			>
				<input
					ref={inputRef}
					type="text"
					inputMode="numeric"
					pattern="[0-9]*"
					autoComplete="one-time-code"
					maxLength={maxLength}
					value={value}
					onChange={handleInputChange}
					onFocus={() => setIsFocused(true)}
					onBlur={() => setIsFocused(false)}
					disabled={disabled}
					className="absolute inset-0 size-full opacity-0 pointer-events-none"
					{...props}
				/>
				{children}
			</div>
		</OTPInputContext.Provider>
	);
}

function InputOTPGroup({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="input-otp-group"
			className={cn(
				"flex items-center rounded-4xl has-aria-invalid:border-destructive has-aria-invalid:ring-[3px] has-aria-invalid:ring-destructive/20 dark:has-aria-invalid:ring-destructive/40",
				className,
			)}
			{...props}
		/>
	);
}

function InputOTPSlot({
	index,
	className,
	...props
}: React.ComponentProps<"div"> & {
	index: number;
}) {
	const inputOTPContext = React.useContext(OTPInputContext);
	const { char, hasFakeCaret, isActive } = inputOTPContext?.slots[index] ?? {};

	return (
		<div
			data-slot="input-otp-slot"
			data-active={isActive}
			className={cn(
				"relative flex size-9 items-center justify-center border-y border-r border-input bg-input/30 text-sm transition-all outline-none first:rounded-l-4xl first:border-l last:rounded-r-4xl aria-invalid:border-destructive data-[active=true]:z-10 data-[active=true]:border-ring data-[active=true]:ring-[3px] data-[active=true]:ring-ring/50 data-[active=true]:aria-invalid:border-destructive data-[active=true]:aria-invalid:ring-destructive/20 dark:data-[active=true]:aria-invalid:ring-destructive/40",
				className,
			)}
			{...props}
		>
			{char}
			{hasFakeCaret && (
				<div className="pointer-events-none absolute inset-0 flex items-center justify-center">
					<div className="h-4 w-px animate-caret-blink bg-foreground duration-1000" />
				</div>
			)}
		</div>
	);
}

function InputOTPSeparator({ ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="input-otp-separator"
			className="flex items-center [&_svg:not([class*='size-'])]:size-4"
			role="separator"
			{...props}
		>
			<MinusIcon />
		</div>
	);
}

export { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot, OTPInputContext };
