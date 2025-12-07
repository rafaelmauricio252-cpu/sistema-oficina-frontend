import api from './api';

export interface OSFoto {
    id: number;
    os_id: number;
    caminho_arquivo: string;
    descricao?: string;
    criado_em: string;
    url: string;
}

interface UploadResponse {
    sucesso: boolean;
    mensagem: string;
    foto: OSFoto;
}

interface ListarFotosResponse {
    sucesso: boolean;
    total: number;
    fotos: OSFoto[];
}

const uploadService = {
    /**
     * Upload de foto para uma OS
     */
    uploadFoto: async (osId: number, file: File, descricao?: string): Promise<UploadResponse> => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('os_id', osId.toString());
        if (descricao) {
            formData.append('descricao', descricao);
        }

        const response = await api.post<UploadResponse>('/upload/foto', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    /**
     * Listar todas as fotos de uma OS
     */
    listarFotos: async (osId: number): Promise<ListarFotosResponse> => {
        const response = await api.get<ListarFotosResponse>(`/upload/fotos/${osId}`);
        return response.data;
    },

    /**
     * Deletar uma foto
     */
    deletarFoto: async (fotoId: number): Promise<{ sucesso: boolean; mensagem: string }> => {
        const response = await api.delete(`/upload/foto/${fotoId}`);
        return response.data;
    },
};

export default uploadService;
