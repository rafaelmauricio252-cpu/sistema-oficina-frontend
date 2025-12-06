import { NumericFormat } from 'react-number-format';
import type { NumericFormatProps } from 'react-number-format';
import { TextField } from '@mui/material';
import type { TextFieldProps } from '@mui/material';
import React from 'react';

interface CustomProps {
    onChange: (event: { target: { name: string; value: string } }) => void;
    name: string;
}

const NumericFormatCustom = React.forwardRef<NumericFormatProps, CustomProps>(
    function NumericFormatCustom(props, ref) {
        const { onChange, ...other } = props;

        return (
            <NumericFormat
                {...other}
                getInputRef={ref}
                onValueChange={(values) => {
                    onChange({
                        target: {
                            name: props.name,
                            value: values.value,
                        },
                    });
                }}
                thousandSeparator="."
                decimalSeparator=","
                valueIsNumericString
                prefix="R$ "
                decimalScale={2}
                fixedDecimalScale
            />
        );
    },
);

type CurrencyInputProps = Omit<TextFieldProps, 'onChange'> & {
    onChange: (value: number) => void;
    value: number | string | undefined;
};

export default function CurrencyInput({ onChange, value, ...props }: CurrencyInputProps) {
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        // Convert back to number for the parent component
        const numericValue = event.target.value ? parseFloat(event.target.value) : 0;
        onChange(numericValue);
    };

    return (
        <TextField
            {...props}
            value={value}
            onChange={handleChange}
            InputProps={{
                inputComponent: NumericFormatCustom as any,
                ...props.InputProps,
            }}
        />
    );
}
