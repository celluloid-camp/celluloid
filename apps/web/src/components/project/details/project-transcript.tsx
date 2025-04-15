"use client";

import type { ProjectById } from "@/lib/trpc/types";
import {
	Card,
	colors,
	Typography,
	CardContent,
	CardHeader,
	Collapse,
	Box,
	IconButton,
	CardActions,
	Button,
} from "@mui/material";
import { useTranslations } from "next-intl";
import { useState } from "react";
import Markdown from "react-markdown";

import { trpc } from "@/lib/trpc/client";
import { LoadingButton } from "@mui/lab";
import type { User } from "@/lib/auth-client";

interface Props {
	project: ProjectById;
	user?: User;
}
export function ProjectTranscript({ project, user }: Props) {
	const t = useTranslations();
	const [expanded, setExpanded] = useState(false);

	const [data] = trpc.transcript.byProjectId.useSuspenseQuery({
		projectId: project.id,
	});

	const mutation = trpc.transcript.generate.useMutation();

	const handleExpandToggle = () => {
		setExpanded(!expanded);
	};

	if (!data && !user) {
		return null;
	}

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
				title="Transcript"
				action={<Box sx={{ display: "flex", alignItems: "center" }}></Box>}
			/>
			<CardContent sx={{ maxHeight: "300px", overflowY: "auto", py: 0 }}>
				<Markdown
					components={{
						p: (props) => {
							return <Typography variant="body1" sx={{ mb: 1 }} {...props} />;
						},
					}}
				>
					{data?.content}
				</Markdown>
			</CardContent>
			<CardActions>
				<Button>Download</Button>
				<LoadingButton
					variant="contained"
					loading={mutation.isPending}
					color="primary"
					disabled={mutation.isPending}
					onClick={async () => {
						mutation.mutate({
							projectId: project.id,
						});
					}}
				>
					Generate Transcript
				</LoadingButton>
			</CardActions>
		</Card>
	);
}
