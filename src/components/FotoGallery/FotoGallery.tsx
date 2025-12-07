import { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    IconButton,
    Typography,
    CircularProgress,
    Alert,
    ImageList,
    ImageListItem,
    ImageListItemBar,
    Snackbar,
} from '@mui/material';
import {
    CloudUpload as UploadIcon,
    Delete as DeleteIcon,
    Close as CloseIcon,
} from '@mui/icons-material';
import uploadService, { type OSFoto } from '../../services/uploadService';

interface FotoGalleryProps {
    osId: number;
    readonly?: boolean;
}

export default function FotoGallery({ osId, readonly = false }: FotoGalleryProps) {
    const [fotos, setFotos] = useState<OSFoto[]>([]);
    const [loading, setLoading] = useState(false);
    const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
    const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
    const [selectedFoto, setSelectedFoto] = useState<OSFoto | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [descricao, setDescricao] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);

    // Carregar fotos ao montar componente
    useEffect(() => {
        loadFotos();
    }, [osId]);

    const loadFotos = async () => {
        try {
            setLoading(true);
            const response = await uploadService.listarFotos(osId);
            setFotos(response.fotos);
        } catch (err: any) {
            console.error('Erro ao carregar fotos:', err);
            setError('Erro ao carregar fotos');
        } finally {
            setLoading(false);
        }
    };

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Validar tamanho (5MB)
        if (file.size > 5 * 1024 * 1024) {
            setError('Arquivo muito grande. Tamanho máximo: 5MB');
            return;
        }

        // Validar tipo
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            setError('Tipo de arquivo não permitido. Use JPG, PNG, GIF ou WebP');
            return;
        }

        setSelectedFile(file);
        setUploadDialogOpen(true);
    };

    const handleUpload = async () => {
        if (!selectedFile) return;

        try {
            setUploading(true);
            await uploadService.uploadFoto(osId, selectedFile, descricao);
            setSuccess('Foto enviada com sucesso!');
            setUploadDialogOpen(false);
            setSelectedFile(null);
            setDescricao('');
            loadFotos(); // Recarregar lista
        } catch (err: any) {
            setError(err.response?.data?.erro || 'Erro ao fazer upload da foto');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (fotoId: number) => {
        if (!window.confirm('Deseja realmente excluir esta foto?')) return;

        try {
            await uploadService.deletarFoto(fotoId);
            setSuccess('Foto excluída com sucesso!');
            loadFotos(); // Recarregar lista
        } catch (err: any) {
            setError(err.response?.data?.erro || 'Erro ao excluir foto');
        }
    };

    const handlePreview = (foto: OSFoto) => {
        setSelectedFoto(foto);
        setPreviewDialogOpen(true);
    };

    const handleCloseUploadDialog = () => {
        setUploadDialogOpen(false);
        setSelectedFile(null);
        setDescricao('');
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box>
            {/* Botão de Upload */}
            {!readonly && (
                <Box mb={2}>
                    <Button
                        variant="contained"
                        component="label"
                        startIcon={<UploadIcon />}
                    >
                        Adicionar Foto
                        <input
                            type="file"
                            hidden
                            accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                            onChange={handleFileSelect}
                        />
                    </Button>
                </Box>
            )}

            {/* Galeria de Fotos */}
            {fotos.length === 0 ? (
                <Alert severity="info">Nenhuma foto anexada a esta ordem de serviço.</Alert>
            ) : (
                <ImageList cols={3} gap={16} sx={{ maxHeight: 500 }}>
                    {fotos.map((foto) => (
                        <ImageListItem key={foto.id}>
                            <img
                                src={foto.url}
                                alt={foto.descricao || 'Foto da OS'}
                                loading="lazy"
                                style={{
                                    height: 200,
                                    objectFit: 'cover',
                                    cursor: 'pointer',
                                }}
                                onClick={() => handlePreview(foto)}
                            />
                            <ImageListItemBar
                                title={foto.descricao || 'Sem descrição'}
                                subtitle={new Date(foto.criado_em).toLocaleDateString('pt-BR')}
                                actionIcon={
                                    !readonly && (
                                        <IconButton
                                            sx={{ color: 'rgba(255, 255, 255, 0.8)' }}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDelete(foto.id);
                                            }}
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    )
                                }
                            />
                        </ImageListItem>
                    ))}
                </ImageList>
            )}

            {/* Dialog de Upload */}
            <Dialog open={uploadDialogOpen} onClose={handleCloseUploadDialog} maxWidth="sm" fullWidth>
                <DialogTitle>Adicionar Foto</DialogTitle>
                <DialogContent>
                    {selectedFile && (
                        <Box>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                                Arquivo: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                            </Typography>
                            <Box mt={2}>
                                <img
                                    src={URL.createObjectURL(selectedFile)}
                                    alt="Preview"
                                    style={{ width: '100%', maxHeight: 300, objectFit: 'contain' }}
                                />
                            </Box>
                            <TextField
                                fullWidth
                                label="Descrição (opcional)"
                                value={descricao}
                                onChange={(e) => setDescricao(e.target.value)}
                                margin="normal"
                                placeholder="Ex: Veículo na entrada, Dano na porta, etc."
                                multiline
                                rows={2}
                            />
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseUploadDialog} disabled={uploading}>
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleUpload}
                        variant="contained"
                        disabled={uploading}
                        startIcon={uploading ? <CircularProgress size={20} /> : <UploadIcon />}
                    >
                        {uploading ? 'Enviando...' : 'Enviar'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Dialog de Preview */}
            <Dialog
                open={previewDialogOpen}
                onClose={() => setPreviewDialogOpen(false)}
                maxWidth="lg"
                fullWidth
            >
                <DialogTitle>
                    {selectedFoto?.descricao || 'Foto da OS'}
                    <IconButton
                        onClick={() => setPreviewDialogOpen(false)}
                        sx={{ position: 'absolute', right: 8, top: 8 }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    {selectedFoto && (
                        <Box>
                            <img
                                src={selectedFoto.url}
                                alt={selectedFoto.descricao || 'Foto da OS'}
                                style={{ width: '100%', height: 'auto' }}
                            />
                            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                                Enviada em: {new Date(selectedFoto.criado_em).toLocaleString('pt-BR')}
                            </Typography>
                        </Box>
                    )}
                </DialogContent>
            </Dialog>

            {/* Snackbars de Feedback */}
            <Snackbar
                open={!!error}
                autoHideDuration={6000}
                onClose={() => setError(null)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert onClose={() => setError(null)} severity="error" sx={{ width: '100%' }}>
                    {error}
                </Alert>
            </Snackbar>

            <Snackbar
                open={!!success}
                autoHideDuration={3000}
                onClose={() => setSuccess(null)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert onClose={() => setSuccess(null)} severity="success" sx={{ width: '100%' }}>
                    {success}
                </Alert>
            </Snackbar>
        </Box>
    );
}
