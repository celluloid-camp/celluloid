import { TextField } from "@mui/material";
import { useDebounce } from "@uidotdev/usehooks";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState } from "react";

interface SearchFilterProps {
  onFilterChange: (value: string) => void;
  placeholder?: string;
}

export function SearchFilter({
  onFilterChange,
  placeholder,
}: SearchFilterProps) {
  const t = useTranslations();
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const isFirstMount = useRef(true);

  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }
    onFilterChange(debouncedSearchTerm);
  }, [debouncedSearchTerm, onFilterChange]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  }, []);

  return (
    <TextField
      sx={{ flex: 1 }}
      variant="outlined"
      size="small"
      value={searchTerm}
      onChange={handleChange}
      placeholder={placeholder}
      fullWidth
    />
  );
}
