import { Licitacao } from '@/interfaces/licitacao/Licitacao'
import { licitacoesMock } from '@/mocks/licitacoesMock'
import { listarLicitacoes } from '@/services/licitacaoService'
import { useEffect, useState } from 'react'

export function useLicitacoes() {

    const [licitacoes, setLicitacoes] = useState<Licitacao[]>([])
    const [loading, setLoading] = useState(true)
    const [erro, setErro] = useState<string | null>(null)

    useEffect(() => {
        carregarLicitacoes()
    }, [])
    
    async function carregarLicitacoes() {
        try {

            const dados = await listarLicitacoes()

            if (!dados || dados.length === 0) {
                // fallback enquanto API não tem dados
                setLicitacoes(licitacoesMock)
            } else {
                setLicitacoes(dados)
            }

        } catch (error: unknown) {

            console.warn('API indisponível, usando mock')

            if (error instanceof Error) {
                setErro(error.message)
            } else {
                setErro('Erro inesperado ao carregar licitações')
            }

            setLicitacoes(licitacoesMock)

        } finally {
            setLoading(false)
        }
    }

    return {
        licitacoes,
        loading,
        erro
    }
}