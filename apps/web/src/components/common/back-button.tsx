import { IconButton } from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import Link from "next/link";

interface BackButtonProps {
	href: string;
	ariaLabel?: string;
}

export const BackButton: React.FC<BackButtonProps> = ({
	href,
	ariaLabel = "back",
}) => {
	return (
		<Link href={href} passHref>
			<IconButton
				size="large"
				aria-label={ariaLabel}
				sx={{ mr: 1, color: "text.primary" }}
			>
				<ChevronLeftIcon />
			</IconButton>
		</Link>
	);
};
