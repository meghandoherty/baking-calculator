import {
  FormLabel,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
} from "@chakra-ui/react";
import { useState } from "react";

interface ScaleInputProps {
  scale: number;
  setScale: React.Dispatch<React.SetStateAction<number>>;
}

const ScaleInput = ({ scale, setScale }: ScaleInputProps) => {
  const [internalScale, setInternalScale] = useState(`${scale}`);

  const onInputChange = (valueAsString: string, valueAsNumber: number) => {
    if (Number.isNaN(valueAsNumber)) {
      setInternalScale(valueAsString);
    } else {
      setScale(valueAsNumber);
      setInternalScale(valueAsString);
    }
  };

  return (
    <div className="scale-control">
      <FormLabel>Scale by</FormLabel>
      <NumberInput
        value={internalScale}
        keepWithinRange={false}
        clampValueOnBlur={false}
        maxW={20}
        isInvalid={scale <= 0}
        onChange={onInputChange}
      >
        <NumberInputField />
        <NumberInputStepper>
          <NumberIncrementStepper />
          <NumberDecrementStepper />
        </NumberInputStepper>
      </NumberInput>
    </div>
  );
};

export default ScaleInput;
