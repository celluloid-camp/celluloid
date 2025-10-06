"use client";
import { LoadingButton } from "@mui/lab";
import {
  Box,
  CircularProgress,
  Divider,
  FormControl,
  FormControlLabel,
  FormLabel,
  Paper,
  Radio,
  RadioGroup,
  Skeleton,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { useFormik } from "formik";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useSnackbar } from "notistack";
import { useState } from "react";
import * as Yup from "yup";
import { BackButton } from "@/components/common/back-button";
import { trpc } from "@/lib/trpc/client";
import { ProjectAnnotations } from "../project-annotations";

export function ProjectDetails({ projectId }: { projectId: string }) {
  const t = useTranslations();
  const { enqueueSnackbar } = useSnackbar();

  const { data: project, isLoading } = trpc.admin.getProjectById.useQuery({
    id: projectId,
  });

  const utils = trpc.useUtils();

  const mutation = trpc.admin.updateProject.useMutation({
    onSuccess: () => {
      enqueueSnackbar(t("admin.project.update.success"), {
        variant: "success",
        key: "admin.project.update.success",
      });
      utils.admin.getProjectById.invalidate({ id: projectId });
    },
    onError: (error) => {
      console.error("Error updating project:", error);
      enqueueSnackbar(t("admin.project.update.error"), {
        variant: "error",
        key: "admin.project.update.error",
      });
    },
  });

  const validationSchema = Yup.object().shape({
    title: Yup.string().required(),
    description: Yup.string().required(),
    public: Yup.boolean(),
    shared: Yup.boolean(),
    collaborative: Yup.boolean(),
  });

  const formik = useFormik({
    initialValues: {
      title: project?.title ?? "",
      description: project?.description ?? "",
      public: project?.public ?? false,
      shared: project?.shared ?? false,
      collaborative: project?.collaborative ?? false,
    },
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
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
    },
  });

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

      <form onSubmit={formik.handleSubmit}>
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
            name="title"
            label={t("admin.project.label.title")}
            fullWidth
            value={formik.values.title}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.title && Boolean(formik.errors.title)}
            helperText={formik.touched.title && formik.errors.title}
            disabled={formik.isSubmitting}
          />

          <TextField
            id="description"
            name="description"
            label={t("admin.project.label.description")}
            fullWidth
            multiline
            rows={4}
            value={formik.values.description}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={
              formik.touched.description && Boolean(formik.errors.description)
            }
            helperText={formik.touched.description && formik.errors.description}
            disabled={formik.isSubmitting}
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
                    checked={formik.values.public}
                    onChange={(e) => {
                      formik.setFieldValue("public", e.target.checked);
                    }}
                    name="public"
                  />
                }
                label={
                  formik.values.public
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
                    checked={formik.values.shared}
                    onChange={(e) => {
                      formik.setFieldValue("shared", e.target.checked);
                    }}
                    name="shared"
                  />
                }
                label={
                  formik.values.shared
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
                    checked={formik.values.collaborative}
                    onChange={(e) => {
                      formik.setFieldValue("collaborative", e.target.checked);
                    }}
                    name="collaborative"
                  />
                }
                label={
                  formik.values.collaborative
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
            <LoadingButton
              variant="contained"
              type="submit"
              loading={formik.isSubmitting}
              disabled={formik.isSubmitting || !formik.dirty}
            >
              {t("profile.update.submit")}
            </LoadingButton>
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
