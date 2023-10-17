import { LoadingButton } from "@mui/lab";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogProps,
  DialogTitle,
  TextField,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { useFormik } from "formik";
import { Trans, useTranslation } from "react-i18next";
import * as Yup from "yup";

import {
  getPeerTubeVideoData,
  PeerTubeVideoWithThumbnail,
} from "~services/peertube";

export type AddVideoToPlaylistDialogProps = DialogProps & {
  onClose: () => void;
  onAddVideo: (video: PeerTubeVideoWithThumbnail) => void;
};
export const AddVideoToPlaylistDialog: React.FC<
  AddVideoToPlaylistDialogProps
> = ({ onClose, onAddVideo, ...props }) => {
  const { t } = useTranslation();

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
      console.log("here");
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
    onSuccess: (data) => {
      if (data.videos) {
        formik.setFieldValue("data", data.videos[0]);
        formik.setFieldTouched("data");
      }
    },
    onError: () => {
      formik.setFieldError(
        "url",
        t("project.create.error.video-info-failed") || ""
      );
    },
  });

  const handleReset = () => {
    formik.resetForm();
  };

  return (
    <Dialog onClose={onClose} fullWidth {...props}>
      <form onSubmit={formik.handleSubmit}>
        <DialogTitle>
          <Trans i18nKey={"project.add-related-video"}>Liste de lecture</Trans>
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            <Trans i18nKey={"project.add-video-playlist-description"}>
              Veuillez saisir l'URL de la vidéo que vous souhaitez ajouter à la
              liste de lecture.
            </Trans>
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
            <Trans i18nKey={"project.submit-add-video-playlist"}>Annuler</Trans>
          </Button>
          <LoadingButton
            variant="contained"
            size="large"
            color="primary"
            type="submit"
            loading={query.isFetching}
            disabled={!formik.isValid}
          >
            <Trans i18nKey={"project.cancel-add-video"}>Ajouter</Trans>
          </LoadingButton>
        </DialogActions>
      </form>
    </Dialog>
  );
};
