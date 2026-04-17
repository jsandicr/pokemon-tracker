import {
    Button,
    IconButton,
    Tooltip,
    useTheme,
    useMediaQuery,
    CircularProgress
} from '@mui/material';

const ResponsiveIconButton = ({
    icon,
    label,
    onClick,
    colorStyles = {},
    size = 'small',
    variant = 'outlined',
    loading = false,
    disabled = false
}) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const content = loading
        ? <CircularProgress size={20} color="inherit" />
        : icon;

    if (isMobile) {
        return (
            <Tooltip title={label}>
                <span>
                    <IconButton
                        onClick={onClick}
                        size={size}
                        disabled={disabled || loading}
                        sx={{
                            width: 40,
                            height: 40,
                            borderRadius: 2,
                            border: '1px solid',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            ...colorStyles
                        }}
                    >
                        {content}
                    </IconButton>
                </span>
            </Tooltip>
        );
    }

    return (
        <Button
            variant={variant}
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : icon}
            onClick={onClick}
            size={size}
            disabled={disabled || loading}
            sx={colorStyles}
        >
            {loading ? 'Guardando...' : label}
        </Button>
    );
};

export default ResponsiveIconButton;