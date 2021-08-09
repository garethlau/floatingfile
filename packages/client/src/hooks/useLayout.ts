import { useBreakpointValue } from "@chakra-ui/react"

export enum Layouts {
    "MOBILE", "TABLET", 'DESKTOP'
}

export default function useLayout() {
    return useBreakpointValue({ base: Layouts.MOBILE, sm: Layouts.TABLET, md: Layouts.DESKTOP })
}