import { LoadingButton } from "@mui/lab";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  type DialogProps,
  DialogTitle,
  TextField,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { useFormik } from "formik";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import * as Yup from "yup";
import {
  getPeerTubeVideoData,
  type PeerTubeVideoWithThumbnail,
} from "@/services/peertube";

export type AddVideoToPlaylistDialogProps = DialogProps & {
  onClose: () => void;
  onAddVideo: (video: PeerTubeVideoWithThumbnail) => void;
};
export const AddVideoToPlaylistDialog: React.FC<
  AddVideoToPlaylistDialogProps
> = ({ onClose, onAddVideo, ...props }) => {
  const t = useTranslations();

  const validationSchema = Yup.object().shape({
    data: Yup.object(),
    url: Yup.string()
      .url(t("project.create.url.not-valid") || "")
      .required(t("project.create.url.required") || ""),
  });

  const formik = useFormik({
    initialValues: {
      url: "",
      data: null,
    },
    validationSchema: validationSchema,
    validateOnBlur: true,
    validateOnMount: false,
    onSubmit: (values) => {
      if (values.data) {
        onAddVideo(values.data as PeerTubeVideoWithThumbnail);
        onClose();
      }

      handleReset();
    },
    onReset: () => {
      // onAddVideo(null);
    },
  });

  const query = useQuery({
    queryKey: ["getAddPeerTubeVideo", formik.values.url],
    queryFn: () => getPeerTubeVideoData(formik.values.url),
    enabled: formik.errors.url == null,
    select: (data) => {
      if (data?.videos) {
        formik.setFieldValue("data", data.videos[0]);
        formik.setFieldTouched("data");
      }
      return data;
    },
  });

  useEffect(() => {
    if (query.error) {
      formik.setFieldError(
        "url",
        t("project.create.error.video-info-failed") || "",
      );
    }
  }, [query.error, formik, t]);

  const handleReset = () => {
    formik.resetForm();
  };

  return (
    <Dialog onClose={onClose} fullWidth {...props}>
      <form onSubmit={formik.handleSubmit}>
        <DialogTitle>{t("project.add-related-video")}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t("project.add-video-playlist-description")}
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="url"
            label={t("home.addVideo")}
            placeholder={t("home.addVideo") || ""}
            type="url"
            fullWidth
            value={formik.values.url}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.url && Boolean(formik.errors.url)}
            helperText={formik.touched.url && formik.errors.url}
            sx={{ borderRadius: 20 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="secondary">
            {t("project.submit-add-video-playlist")}
          </Button>
          <LoadingButton
            variant="contained"
            size="large"
            color="primary"
            type="submit"
            loading={query.isFetching}
            disabled={!formik.isValid}
          >
            {t("project.cancel-add-video")}
          </LoadingButton>
        </DialogActions>
      </form>
    </Dialog>
  );
};
