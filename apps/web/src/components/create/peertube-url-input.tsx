"use client";
import ClearIcon from "@mui/icons-material/Clear";
import KeyboardReturnIcon from "@mui/icons-material/KeyboardReturn";
import LinkIcon from "@mui/icons-material/Link";
import {
  Alert,
  Chip,
  IconButton,
  InputAdornment,
  TextField,
} from "@mui/material";
import { useMutation, useQuery } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import React from "react";
import { z } from "zod";

import {
  getPeerTubeVideoData,
  type PeerTubeVideoDataResult,
} from "@/services/peertube";
import { useTranslations } from "next-intl";

type PeerTubeVideoUrlFormProps = {
  onLoaded: (data: PeerTubeVideoDataResult | null) => void;
  onReset: () => void;
  url?: string;
};

export function PeerTubeUrlInput({
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
    error: z.any().nullable(),
  });

  type FormValues = z.infer<typeof formSchema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      url: url,
      error: null,
    },
  });

  const mutation = useMutation({
    mutationFn: (url: string) => getPeerTubeVideoData(url),
    retry: false,
  });

  // React.useEffect(() => {
  //   if (query.data && !isSubmitted) {
  //     onLoaded(query.data);
  //   }
  // }, [query.data, isSubmitted, onLoaded]);

  // React.useEffect(() => {
  //   if (query.error) {
  //     setValue("error", t("project.create.error.video-info-failed"));
  //   }
  // }, [query.error, setValue, t]);

  // React.useEffect(() => {
  //   if (data === null && isSubmitted) {
  //     reset();
  //   }
  // }, [data, reset, isSubmitted]);

  const handleReset = () => {
    form.reset();
    onReset();
    onLoaded(null);
  };

  const onSubmit = async (values: FormValues) => {
    try {
      const data = await mutation.mutateAsync(values.url);
      onLoaded(data);
    } catch (e) {
      form.setValue("error", t("project.create.error.video-info-failed"));
      form.reset();
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <TextField
        {...form.register("url")}
        label={t("home.addVideo")}
        fullWidth
        margin="normal"
        placeholder={t("home.addVideo") || ""}
        disabled={form.formState.isSubmitted && form.formState.isValid}
        error={Boolean(form.formState.errors.url)}
        helperText={form.formState.errors.url?.message}
        sx={{ borderRadius: 20 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <LinkIcon />
            </InputAdornment>
          ),
          endAdornment:
            form.formState.isSubmitted && form.formState.isValid ? (
              <InputAdornment position="end">
                <IconButton onClick={handleReset} edge="end">
                  <ClearIcon />
                </IconButton>
              </InputAdornment>
            ) : (
              <IconButton
                data-testid="submit-url"
                onClick={form.handleSubmit(onSubmit)}
                color="primary"
                edge="end"
              >
                <KeyboardReturnIcon />
              </IconButton>
            ),
        }}
        inputProps={{
          "data-testid": "url",
        }}
      />
      {form.formState.errors.error && (
        <Alert severity="error" sx={{ borderRadius: 0, mt: 0 }}>
          {JSON.stringify(form.formState.errors.error)}
        </Alert>
      )}
    </form>
  );
}
