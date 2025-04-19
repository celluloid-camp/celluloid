"use client";

import type { User } from "@/lib/auth-client";
import type { ProjectById } from "@/lib/trpc/types";
import FormatBoldIcon from "@mui/icons-material/FormatBold";
import FormatItalicIcon from "@mui/icons-material/FormatItalic";
import FormatStrikethroughIcon from "@mui/icons-material/FormatStrikethrough";
import {
  Box,
  Button,
  Card,
  CircularProgress,
  Stack,
  ToggleButton,
  Typography,
  colors,
} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
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
import { Markdown } from "tiptap-markdown";

import { trpc } from "@/lib/trpc/client";
import dayjs from "@/utils/dayjs";
import { debounce } from "lodash";
import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

interface Props {
  project: ProjectById;
  user?: User;
}
export function ProjectNotes({ project, user }: Props) {
  const t = useTranslations();
  const [isSaving, setIsSaving] = useState(false);
  const notesRef = useRef<{ getContentAsText: () => string }>(null);

  const [data] = trpc.note.byProjectId.useSuspenseQuery({
    projectId: project.id,
  });

  const utils = trpc.useUtils();
  const updateNote = trpc.note.update.useMutation({
    onSuccess: () => {
      setTimeout(() => {
        setIsSaving(false);
      }, 500);
    },
    onSettled: () => {
      utils.note.byProjectId.invalidate({
        projectId: project.id,
      });
    },
  });

  // Using useCallback to maintain function reference
  const debouncedUpdate = useCallback(
    debounce((content: JSON) => {
      setIsSaving(true);
      updateNote.mutate({
        projectId: project.id,
        content: content,
      });
    }, 2000),
    [],
  );

  const handleDownload = () => {
    if (notesRef.current) {
      const textContent = notesRef.current.getContentAsText();
      const blob = new Blob([textContent], {
        type: "text/plain",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${project.title}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleUpdate = (content: JSON) => {
    debouncedUpdate(content);
  };

  if (!user) {
    return null;
  }

  return (
    <Card
      sx={{
        my: 2,
        backgroundColor: colors.yellow[50],
        borderRadius: 1,
        position: "relative",
        overflow: "visible",
        "&:before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: "1.5rem",
          width: "2px",
          height: "100%",
          backgroundColor: colors.red[200],
          zIndex: 1,
        },
      }}
    >
      <Box
        sx={{
          borderBottom: `1px solid ${colors.grey[300]}`,
          backgroundImage: `repeating-linear-gradient(${colors.blue[50]} 0px, ${colors.blue[50]} 29px, ${colors.grey[300]} 29px, ${colors.grey[300]} 30px)`,
          p: 3,
          pt: 2,
          pb: 1,
          position: "relative",
          borderRadius: 1,
          overflow: "hidden",
        }}
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography
            variant="h6"
            sx={{
              color: colors.grey[800],
              mb: 1,
              position: "relative",
              zIndex: 2,
              ml: 2,
            }}
          >
            {t("project.note.title")}
          </Typography>
          {isSaving ? (
            <Stack direction="row" spacing={1} alignItems="center">
              <CircularProgress size={12} color="primary" />
              <Typography variant="body2" color="text.secondary">
                {t("project.note.saving")}.
              </Typography>
            </Stack>
          ) : null}
        </Stack>
        <Box
          sx={{
            ml: 2,
            minHeight: "200px",
            maxHeight: "400px",
            overflow: "auto",
          }}
        >
          <TiptapNotes
            content={data?.content as unknown as JSON}
            onUpdate={handleUpdate}
            ref={notesRef}
          />
          {data && (
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography variant="caption" color="text.secondary">
                {t("project.note.update_at")} {dayjs(data?.updatedAt).fromNow()}
              </Typography>
              <Button variant="text" size="small" onClick={handleDownload}>
                <DownloadIcon />
                {t("project.note.button.download")}
              </Button>
            </Box>
          )}
        </Box>
      </Box>
    </Card>
  );
}

const TiptapNotes = forwardRef<
  { getContentAsText: () => string },
  { content: JSON; onUpdate: (content: JSON) => void }
>(({ content, onUpdate }, ref) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Strike,
      Placeholder.configure({
        placeholder: "Write something...",
      }),
      Markdown,
      // Mention.configure({
      // 	HTMLAttributes: {
      // 		class: "mention",
      // 	},
      // 	suggestion,
      // }),
    ],
    content: content,
    onUpdate: ({ editor }) => {
      onUpdate(editor.getJSON() as unknown as JSON);
    },
  });

  useImperativeHandle(ref, () => ({
    getContentAsText: () => {
      return editor ? editor.getText() : "";
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
