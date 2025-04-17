"use client";
import { AppBar, Box, type BoxProps, Button, Toolbar } from "@mui/material";
import type * as React from "react";
import { useTranslations } from "next-intl";
import { LogoWithLabel } from "./logo-with-label";

import { LanguageSwitch } from "./language-switch";
import { useSession } from "@/lib/auth-client";

import Link from "next/link";
import { UserMenu } from "./user-menu";

export const Header: React.FC<BoxProps> = ({ children }) => {
	const t = useTranslations();
	const { data: session } = useSession();
	return (
		<AppBar color="default" position="fixed">
			<Toolbar disableGutters>
				<Box flexGrow={1}>
					<Link href="/">
						<Button>
							<LogoWithLabel />
						</Button>
					</Link>
				</Box>

				<Button
					data-testid="header-create-button"
					component={Link}
					href="/create"
					sx={{
						textTransform: "uppercase",
						color: "text.primary",
						fontSize: 13,
					}}
				>
					{t("menu.create")}
				</Button>

				<Button
					data-testid="header-join-button"
					component={Link}
					sx={{
						textTransform: "uppercase",
						color: "text.primary",
						fontSize: 13,
					}}
					href={session ? "/join" : "/student-signup"}
				>
					{t("menu.join")}
				</Button>

				<Button
					sx={{
						textTransform: "uppercase",
						color: "text.primary",
						fontSize: 13,
					}}
					component={Link}
					href="/"
				>
					{t("menu.explore")}
				</Button>

				<Button
					sx={{
						textTransform: "uppercase",
						color: "text.primary",
						fontSize: 13,
					}}
					component={Link}
					href="/about"
				>
					{t("menu.about")}
				</Button>

				<UserMenu />
				<LanguageSwitch />
			</Toolbar>
		</AppBar>
	);
};
