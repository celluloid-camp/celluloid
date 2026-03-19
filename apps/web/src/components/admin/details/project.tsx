"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Box,
  Divider,
  FormControl,
  FormControlLabel,
  FormLabel,
  Paper,
  Skeleton,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import Button from "@mui/material/Button";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useSnackbar } from "notistack";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { BackButton } from "@/components/common/back-button";
import { useTRPC } from "@/lib/trpc/client";
import { ProjectAnnotations } from "../project-annotations";

export function ProjectDetails({ projectId }: { projectId: string }) {
  const t = useTranslations();
  const { enqueueSnackbar } = useSnackbar();
  const api = useTRPC();
  const queryClient = useQueryClient();
  const { data: project, isLoading } = useQuery(
    api.admin.getProjectById.queryOptions({
      id: projectId,
    }),
  );

  const mutation = useMutation(
    api.admin.updateProject.mutationOptions({
      onSuccess: () => {
        enqueueSnackbar(t("admin.project.update.success"), {
          variant: "success",
          key: "admin.project.update.success",
        });
        queryClient.invalidateQueries(
          api.admin.getProjectById.queryFilter({ id: projectId }),
        );
      },
      onError: (error) => {
        console.error("Error updating project:", error);
        enqueueSnackbar(t("admin.project.update.error"), {
          variant: "error",
          key: "admin.project.update.error",
        });
      },
    }),
  );

  const editProjectSchema = z.object({
    title: z.string().min(1, t("admin.project.label.title")),
    description: z.string().min(1, t("admin.project.label.description")),
    public: z.boolean(),
    shared: z.boolean(),
    collaborative: z.boolean(),
  });

  type EditProjectFormValues = z.infer<typeof editProjectSchema>;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<EditProjectFormValues>({
    resolver: zodResolver(editProjectSchema),
    defaultValues: {
      title: project?.title ?? "",
      description: project?.description ?? "",
      public: project?.public ?? false,
      shared: project?.shared ?? false,
      collaborative: project?.collaborative ?? false,
    },
    mode: "onBlur",
  });

  useEffect(() => {
    if (project) {
      reset({
        title: project.title,
        description: project.description,
        public: project.public,
        shared: project.shared,
        collaborative: project.collaborative,
      });
    }
  }, [project, reset]);

  const onSubmit = async (values: EditProjectFormValues) => {
    try {
      await mutation.mutateAsync({
        projectId,
        title: values.title,
        description: values.description,
        public: values.public,
        shared: values.shared,
        collaborative: values.collaborative,
      });
    } catch (error) {
      console.error("Error updating project:", error);
    }
  };

  if (isLoading) {
    return <ProjectSkeleton />;
  }

  if (!project) {
    return (
      <Paper sx={{ width: "100%", p: 4 }}>
        <Typography variant="h6" color="error">
          {t("admin.projects.list.empty")}
        </Typography>
        <Box sx={{ mt: 2 }}>
          <BackButton href="/admin" ariaLabel="back to admin" />
        </Box>
      </Paper>
    );
  }

  return (
    <Paper sx={{ width: "100%", p: 4 }}>
      <Box sx={{ display: "flex", marginBottom: 4 }}>
        <BackButton href="/admin" ariaLabel="back to admin" />
        <Typography variant="h5">{t("admin.project.title")}</Typography>
      </Box>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
            mt: 2,
            maxWidth: "700px",
          }}
        >
          <TextField
            id="title"
            label={t("admin.project.label.title")}
            fullWidth
            {...register("title")}
            error={Boolean(errors.title)}
            helperText={errors.title?.message}
            disabled={isSubmitting}
          />

          <TextField
            id="description"
            label={t("admin.project.label.description")}
            fullWidth
            multiline
            rows={4}
            {...register("description")}
            error={Boolean(errors.description)}
            helperText={errors.description?.message}
            disabled={isSubmitting}
          />

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr 1fr" },
              gap: 3,
            }}
          >
            <FormControl component="fieldset">
              <FormLabel component="legend">
                {t("admin.project.label.public")}
              </FormLabel>
              <FormControlLabel
                control={
                  <Switch
                    checked={watch("public")}
                    onChange={(e) => {
                      setValue("public", e.target.checked, {
                        shouldDirty: true,
                      });
                    }}
                    name="public"
                  />
                }
                label={
                  watch("public")
                    ? t("admin.project.setting.label.yes")
                    : t("admin.project.setting.label.no")
                }
              />
            </FormControl>

            <FormControl component="fieldset">
              <FormLabel component="legend">
                {t("admin.project.shared.label")}
              </FormLabel>
              <FormControlLabel
                control={
                  <Switch
                    checked={watch("shared")}
                    onChange={(e) => {
                      setValue("shared", e.target.checked, {
                        shouldDirty: true,
                      });
                    }}
                    name="shared"
                  />
                }
                label={
                  watch("shared")
                    ? t("admin.project.setting.label.yes")
                    : t("admin.project.setting.label.no")
                }
              />
            </FormControl>

            <FormControl component="fieldset">
              <FormLabel component="legend">
                {t("admin.project.label.collab")}
              </FormLabel>
              <FormControlLabel
                control={
                  <Switch
                    checked={watch("collaborative")}
                    onChange={(e) => {
                      setValue("collaborative", e.target.checked, {
                        shouldDirty: true,
                      });
                    }}
                    name="collaborative"
                  />
                }
                label={
                  watch("collaborative")
                    ? t("admin.project.setting.label.yes")
                    : t("admin.project.setting.label.no")
                }
              />
            </FormControl>
          </Box>
          <Divider sx={{ my: 2 }} />
          <Box>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 2,
                mt: 2,
              }}
            >
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  {t("admin.project.label.owner")}
                </Typography>
                <Typography>{project.user.username}</Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  {t("admin.project.label.date")}
                </Typography>
                <Typography>
                  {new Date(project.publishedAt).toLocaleString()}
                </Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  {t("admin.project.label.code")}
                </Typography>
                <Typography>{project.shareCode}</Typography>
              </Box>
            </Box>
          </Box>
          <Box sx={{ mt: 3 }}>
            <Button
              variant="contained"
              type="submit"
              loading={isSubmitting}
              disabled={!isDirty}
            >
              {t("profile.update.submit")}
            </Button>
          </Box>
        </Box>
      </form>
      <ProjectAnnotations projectId={projectId} />
    </Paper>
  );
}

export function ProjectSkeleton() {
  return (
    <Paper sx={{ width: "100%", p: 4 }}>
      <Skeleton width="300px" height={32} sx={{ mb: 4 }} />

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 2,
          mt: 2,
          maxWidth: "700px",
        }}
      >
        <Skeleton variant="rectangular" height={56} width="100%" />
        <Skeleton variant="rectangular" height={125} width="100%" />

        <Skeleton width="150px" height={24} sx={{ mt: 2 }} />

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr 1fr" },
            gap: 3,
          }}
        >
          {[1, 2, 3].map((item) => (
            <Box key={item}>
              <Skeleton width="80px" height={24} />
              <Skeleton width="150px" height={48} />
            </Box>
          ))}
        </Box>

        <Box sx={{ mt: 2 }}>
          <Skeleton variant="rectangular" width={120} height={36} />
        </Box>
      </Box>

      <Box sx={{ mt: 4 }}>
        <Skeleton width="200px" height={32} sx={{ mb: 2 }} />

        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
          {[1, 2, 3].map((item) => (
            <Box key={item}>
              <Skeleton width="100px" height={20} />
              <Skeleton width="150px" height={24} />
            </Box>
          ))}
        </Box>
      </Box>
    </Paper>
  );
}
