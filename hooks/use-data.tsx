import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner";

const useData = <T,>(key: string, url: string) => {
    return useQuery<T[]>({
        queryKey: [key],
        queryFn: async () => {
            const response = await fetch(url);
            let result = await response.json()
            return result
        },
        staleTime: 5 * 60 * 1000,
        retry: 2
    })
}

const useMutateData = <T,>(key: string, url:string) => {
    const queryClient = useQueryClient()

    const addMutation = useMutation({
        mutationFn: async (newData: Omit<T, "id">) => {
            console.log(url);
            
            const response = await fetch(url, {
                method: "POST",
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(newData)
            })

            if(response.ok) {
                toast(`${key} berhasil ditambahkan!`)
            } else {
                toast(`gagal menambahkan ${key}`)
            }

            const result = response.json()
            return result
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [key]})
        }
    })

    const editMutation = useMutation({
        mutationFn: async ({id, updatedData}: {id: string; updatedData: T}) => {
            const response = await fetch(`${url}`, {
                method: "PUT", 
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(updatedData)
            })

            if(response.ok) {
                toast(`${key} berhasil diperbarui!`)
            } else {
                toast(`gagal memperbarui ${key}`)
            }

            const result = response.json()
            return result
        }, 

        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: [key]})
        }
    })

    const deleteMutation = useMutation({
        mutationFn: async(id: string) => {
            const response = await fetch(`${url}`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({id})
            })

            if(response.ok) {
                toast(`${key} berhasil dihapus!`)
            } else {
                toast(`gagal menghapus ${key}`)
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: [key]})
        }
    })

    return {addMutation, editMutation, deleteMutation}
    
}

export {useData, useMutateData}