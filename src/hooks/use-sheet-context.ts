
'use client'
import { createContext, useContext } from "react";

export type SheetContextType = {
    open?: boolean,
    setOpen?: (open: boolean) => void;
}
export const SheetContext = createContext<SheetContextType>({});

export const useSheetContext = () => useContext(SheetContext);
