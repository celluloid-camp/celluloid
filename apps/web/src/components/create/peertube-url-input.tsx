"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import ClearIcon from "@mui/icons-material/Clear";
import KeyboardReturnIcon from "@mui/icons-material/KeyboardReturn";
import LinkIcon from "@mui/icons-material/Link";
import { IconButton, InputAdornment, TextField } from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  getPeerTubeVideoData,
  type PeerTubeVideoDataResult,
} from "@/services/peertube";

type PeerTubeVideoUrlFormProps = {
  autoLoad?: boolean;
  onLoaded: (data: PeerTubeVideoDataResult | null) => void;
  onReset: () => void;
  url?: string;
};

export function PeerTubeUrlInput({
  autoLoad = false,
  onLoaded,
  onReset,
  url,
}: PeerTubeVideoUrlFormProps) {
  const t = useTranslations();

  const formSchema = z.object({
    url: z
      .string()
      .url(t("project.create.url.not-valid"))
      .min(1, t("project.create.url.required")),
  });

  type FormValues = z.infer<typeof formSchema>;

  const {
    register,
    formState: { errors, isSubmitted, isValid },
    setError,
    reset,
    handleSubmit,
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      url: url,
    },
  });

  const mutation = useMutation({
    mutationFn: (url: string) => getPeerTubeVideoData(url),
    retry: false,
  });

  const onSubmit = async (values: FormValues) => {
    try {
      const data = await mutation.mutateAsync(values.url);
      onLoaded(data);
    } catch (e) {
      console.log("error", e);
      setError(
        "url",
        { message: t("project.create.url.not-valid"), type: "focus" },
        { shouldFocus: true },
      );
    }
  };

  React.useEffect(() => {
    if (autoLoad && url?.trim()) {
      void handleSubmit(onSubmit)();
    }
    // Only auto-load once when arriving from search with a URL.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoLoad, url]);

  const handleReset = () => {
    reset();
    onReset();
    onLoaded(null);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <TextField
        {...register("url")}
        label={t("home.addVideo")}
        fullWidth
        margin="normal"
        placeholder={t("home.addVideo") || ""}
        disabled={isSubmitted && isValid}
        error={Boolean(errors.url)}
        helperText={errors.url?.message}
        sx={{ borderRadius: 20 }}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <LinkIcon />
              </InputAdornment>
            ),
            endAdornment:
              isSubmitted && isValid ? (
                <InputAdornment position="end">
                  <IconButton onClick={handleReset} edge="end">
                    <ClearIcon />
                  </IconButton>
                </InputAdornment>
              ) : (
                <IconButton
                  data-testid="submit-url"
                  onClick={handleSubmit(onSubmit)}
                  color="primary"
                  edge="end"
                >
                  <KeyboardReturnIcon />
                </IconButton>
              ),
          },

          htmlInput: {
            "data-testid": "url",
          },
        }}
      />
    </form>
  );
}
