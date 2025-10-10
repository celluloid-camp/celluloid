import { zodResolver } from "@hookform/resolvers/zod";
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
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
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

  const schema = z.object({
    url: z
      .string()
      .min(1, t("project.create.url.required") || "")
      .url(t("project.create.url.not-valid") || ""),
    data: z.custom<PeerTubeVideoWithThumbnail | null>(),
  });

  type FormValues = z.infer<typeof schema>;

  const {
    handleSubmit,
    register,
    setValue,
    setError,
    reset,
    watch,
    formState: { errors, isValid, touchedFields },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: "onBlur",
    reValidateMode: "onChange",
    defaultValues: { url: "", data: null },
  });

  const url = watch("url");

  const query = useQuery({
    queryKey: ["getAddPeerTubeVideo", url],
    queryFn: () => getPeerTubeVideoData(url),
    enabled: !errors.url && Boolean(url),
  });

  useEffect(() => {
    const data = query.data as
      | { videos?: PeerTubeVideoWithThumbnail[] }
      | undefined;
    const next = data?.videos?.[0];
    if (next) {
      const current =
        (watch("data") as PeerTubeVideoWithThumbnail | null) || null;
      if (!current || (current as any).uuid !== (next as any).uuid) {
        setValue("data", next, {
          shouldDirty: false,
          shouldTouch: true,
          shouldValidate: false,
        });
      }
    }
  }, [query.data, setValue, watch]);

  useEffect(() => {
    if (query.error) {
      setError("url", {
        type: "server",
        message: t("project.create.error.video-info-failed") || "",
      });
    }
  }, [query.error, setError, t]);

  const handleReset = () => {
    reset();
  };

  return (
    <Dialog onClose={onClose} fullWidth {...props}>
      <form
        onSubmit={handleSubmit((values) => {
          if (values.data) {
            onAddVideo(values.data as PeerTubeVideoWithThumbnail);
            onClose();
          }
          handleReset();
        })}
      >
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
            {...register("url")}
            error={Boolean(touchedFields.url) && Boolean(errors.url)}
            helperText={Boolean(touchedFields.url) && errors.url?.message}
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
            disabled={!isValid}
          >
            {t("project.cancel-add-video")}
          </LoadingButton>
        </DialogActions>
      </form>
    </Dialog>
  );
};
