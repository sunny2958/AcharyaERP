import {
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
} from "@mui/material";

// name: string
// label: string
// value: any
// items: { value: any, label: string }[]
// handleChange: () => void
// required?: boolean
// row?: boolean

// For string values, initialise your state to empty string "".
// For any other kind of values like numbers or objects, initialise your state to null.

function CustomRadioButtons({
  name,
  label,
  value,
  items,
  handleChange,
  required = false,
  row = true,
  disabled = false,
}) {
  return (
    <FormControl fullWidth required={required}>
      <FormLabel>{label}</FormLabel>
      <RadioGroup
        row={row}
        value={value}
        onChange={(e) => {
          handleChange(e);
        }}
        name={name}
      >
        {items.map((obj, index) => (
          <FormControlLabel
            key={index}
            value={obj.value}
            control={
              <Radio
                disabled={disabled}
                sx={{
                  "& .MuiSvgIcon-root": {
                    fontSize: 19,
                  },
                }}
              />
            }
            label={obj.label}
          />
        ))}
      </RadioGroup>
    </FormControl>
  );
}

export default CustomRadioButtons;
