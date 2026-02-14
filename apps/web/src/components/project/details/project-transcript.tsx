"use client";

import { Download as DownloadIcon } from "@mui/icons-material";
import FormatBoldIcon from "@mui/icons-material/FormatBold";
import FormatItalicIcon from "@mui/icons-material/FormatItalic";
import FormatStrikethroughIcon from "@mui/icons-material/FormatStrikethrough";
import SaveIcon from "@mui/icons-material/Save";
import { LoadingButton } from "@mui/lab";
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  CircularProgress,
  Collapse,
  colors,
  IconButton,
  Stack,
  ToggleButton,
  Typography,
} from "@mui/material";
import Placeholder from "@tiptap/extension-placeholder";
import Strike from "@tiptap/extension-strike";
import {
  BubbleMenu,
  EditorContent,
  FloatingMenu,
  useEditor,
} from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useTranslations } from "next-intl";
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import type { FallbackProps } from "react-error-boundary";
import { Markdown as TiptapMarkdown } from "tiptap-markdown";
import { StyledMarkdown } from "@/components/common/markdown";
import type { User } from "@/lib/auth-client";
import { trpc } from "@/lib/trpc/client";
import type { ProjectById } from "@/lib/trpc/types";
import dayjs from "@/utils/dayjs";

interface Props {
  project: ProjectById;
  user?: User;
}
export function ProjectTranscript({ project, user }: Props) {
  const t = useTranslations();
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const transcriptRef = useRef<{
    getContentAsText: () => string;
    getContentAsMarkdown: () => string;
  }>(null);

  const utils = trpc.useUtils();
  const [data] = trpc.transcript.byProjectId.useSuspenseQuery({
    projectId: project.id,
  });

  const generateMutation = trpc.transcript.generate.useMutation({
    onSettled: () => {
      utils.project.byId.invalidate({ id: project.id });
      utils.transcript.byProjectId.invalidate({ projectId: project.id });
    },
  });

  const updateMutation = trpc.transcript.update.useMutation({
    onSuccess: () => {
      setHasUnsavedChanges(false);
      utils.transcript.byProjectId.invalidate({ projectId: project.id });
    },
  });

  if (!data && !user) {
    return null;
  }

  const canEdit =
    user &&
    (user.role === "admin" || user.id === project.userId) &&
    data?.content;

  const canGenerateTranscript =
    (user?.role === "admin" || user?.id === project.userId) &&
    !data?.content &&
    project.transcriptProcessingStatus === "in_progress";

  const downloadTranscript = (content: string) => {
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${project.title}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownload = () => {
    if (transcriptRef.current) {
      const textContent = transcriptRef.current.getContentAsText();
      downloadTranscript(textContent);
    } else if (data?.content) {
      downloadTranscript(data.content);
    }
  };

  const handleSave = () => {
    if (transcriptRef.current) {
      const markdownContent = transcriptRef.current.getContentAsMarkdown();
      updateMutation.mutate({
        projectId: project.id,
        content: markdownContent,
      });
    }
  };

  const handleContentChange = () => {
    setHasUnsavedChanges(true);
  };

  return (
    <Card
      sx={{
        my: 2,
        backgroundColor: colors.yellow[50],
        borderRadius: 1,
      }}
    >
      <CardHeader
        sx={{ p: 2, borderBottom: `1px solid ${colors.grey[300]}` }}
        title={
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{ width: "100%" }}
          >
            <Typography variant="h6">
              {t("project.transcript.title")}
            </Typography>
          </Stack>
        }
      />
      <CardContent sx={{ p: 3, maxHeight: "300px", overflowY: "auto" }}>
        {isTranscriptInProgress ? (
          <Box sx={{ py: 2, display: "flex", alignItems: "center", gap: 1 }}>
            <CircularProgress size={12} color="primary" />
            <Typography variant="body2">
              {t("project.transcript.generating")}
            </Typography>
          </Box>
        ) : data?.content && canEdit ? (
          <>
            <TiptapTranscript
              content={data.content}
              onContentChange={handleContentChange}
              ref={transcriptRef}
            />
            {data && (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "flex-start",
                  alignItems: "center",
                  mt: 2,
                }}
              >
                <Typography variant="caption" color="text.secondary">
                  {t("project.note.update_at")}{" "}
                  {data?.updatedAt
                    ? dayjs(data.updatedAt).fromNow()
                    : data?.createdAt
                      ? dayjs(data.createdAt).fromNow()
                      : ""}
                </Typography>
              </Box>
            )}
          </>
        ) : data?.content ? (
          <StyledMarkdown content={data?.content} />
        ) : (
          <Typography variant="body2">
            {t("project.transcript.empty")}
          </Typography>
        )}
      </CardContent>

      <CardActions
        sx={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1,
        }}
      >
        <Stack direction="row" spacing={1}>
          {canEdit && hasUnsavedChanges && (
            <LoadingButton
              variant="contained"
              loading={updateMutation.isPending}
              color="primary"
              disabled={updateMutation.isPending}
              startIcon={<SaveIcon />}
              onClick={handleSave}
            >
              {t("project.transcript.button.save")}
            </LoadingButton>
          )}
          {canGenerateTranscript && (
            <LoadingButton
              variant="contained"
              loading={generateMutation.isPending}
              color="primary"
              disabled={generateMutation.isPending}
              onClick={async () => {
                generateMutation.mutate({
                  projectId: project.id,
                });
              }}
            >
              {t("project.transcript.button.generate")}
            </LoadingButton>
          )}
        </Stack>
        {data?.content ? (
          <Button onClick={handleDownload} sx={{ color: colors.grey[800] }}>
            <DownloadIcon />
            {t("project.transcript.button.download")}
          </Button>
        ) : null}
      </CardActions>
    </Card>
  );
}

const TiptapTranscript = forwardRef<
  { getContentAsText: () => string; getContentAsMarkdown: () => string },
  { content: string; onContentChange: () => void }
>(({ content, onContentChange }, ref) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Strike,
      Placeholder.configure({
        placeholder: "Transcript content...",
      }),
      TiptapMarkdown,
    ],
    content: content || "",
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none",
      },
    },
    onUpdate: () => {
      // Notify parent that content has changed
      onContentChange();
    },
  });

  // Update editor content when content prop changes
  useEffect(() => {
    if (editor && content !== undefined) {
      const currentMarkdown = editor.storage.markdown.getMarkdown();
      // Only update if content actually changed to avoid infinite loops
      if (currentMarkdown !== content) {
        // Use setContent with markdown - the markdown extension will parse it
        editor.commands.setContent(content, false, {
          preserveWhitespace: "full",
        });
      }
    }
  }, [content, editor]);

  useImperativeHandle(ref, () => ({
    getContentAsText: () => {
      return editor ? editor.getText() : "";
    },
    getContentAsMarkdown: () => {
      return editor ? editor.storage.markdown.getMarkdown() : "";
    },
  }));

  return (
    <>
      {editor && (
        <BubbleMenu
          className="bubble-menu"
          tippyOptions={{ duration: 100 }}
          editor={editor}
        >
          <ToggleButton
            size="small"
            value={true}
            selected={editor.isActive("bold")}
            onChange={() => editor.chain().focus().toggleBold().run()}
          >
            <FormatBoldIcon />
          </ToggleButton>
          <ToggleButton
            size="small"
            value={true}
            selected={editor.isActive("italic")}
            onChange={() => editor.chain().focus().toggleItalic().run()}
          >
            <FormatItalicIcon />
          </ToggleButton>
          <ToggleButton
            size="small"
            value={true}
            selected={editor.isActive("strike")}
            onChange={() => editor.chain().focus().toggleStrike().run()}
          >
            <FormatStrikethroughIcon />
          </ToggleButton>
        </BubbleMenu>
      )}

      {editor && (
        <FloatingMenu
          className="floating-menu"
          tippyOptions={{ duration: 100 }}
          editor={editor}
        >
          <ToggleButton
            size="small"
            value={true}
            selected={editor.isActive("heading", { level: 1 })}
            onChange={() =>
              editor.chain().focus().toggleHeading({ level: 1 }).run()
            }
          >
            H1
          </ToggleButton>
          <ToggleButton
            size="small"
            value={true}
            selected={editor.isActive("heading", { level: 2 })}
            onChange={() =>
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            }
          >
            H2
          </ToggleButton>
          <ToggleButton
            size="small"
            value={true}
            selected={editor.isActive("bulletList")}
            onChange={() => editor.chain().focus().toggleBulletList().run()}
          >
            Bullet list
          </ToggleButton>
        </FloatingMenu>
      )}

      <EditorContent editor={editor} />
    </>
  );
});

export function TranscriptErrorFallback({
  error,
  resetErrorBoundary,
}: FallbackProps) {
  const t = useTranslations();
  return (
    <Card
      sx={{
        my: 2,
        backgroundColor: colors.yellow[50],
        borderRadius: 1,
      }}
    >
      <CardHeader
        sx={{ p: 2, borderBottom: `1px solid ${colors.grey[300]}` }}
        title={t("project.transcript.title")}
      />
      <CardContent sx={{ maxHeight: "300px", overflowY: "auto", py: 0 }}>
        {t("project.transcript.failed")}

        {process.env.NODE_ENV === "development" && <pre>{error.message}</pre>}
        <Button onClick={resetErrorBoundary}>
          {t("project.transcript.try-again")}
        </Button>
      </CardContent>
    </Card>
  );
}
