import { useState } from 'react';
import { DEFAULT_FILTERS } from '../constants/filterOptions';

export const useFilters = () => {
    // Bộ lọc chính đang áp dụng
    const [filters, setFilters] = useState(DEFAULT_FILTERS);

    // State tạm cho UI (chỉ áp dụng khi bấm "Áp dụng")
    const [draftPrice, setDraftPrice] = useState([0, 20]);
    const [draftArea, setDraftArea] = useState([0, 150]);
    const [draftTypes, setDraftTypes] = useState([]);
    const [draftUtilities, setDraftUtilities] = useState([]);
    const [draftTrusts, setDraftTrusts] = useState({ vip: false, verified: false, normal: true });

    const applyPrice = () => setFilters((f) => ({ ...f, price: draftPrice }));
    const applyArea = () => setFilters((f) => ({ ...f, area: draftArea }));
    const applyTypes = () => setFilters((f) => ({ ...f, types: draftTypes }));
    const applyUtilities = () => setFilters((f) => ({ ...f, utilities: draftUtilities }));
    const applyTrusts = () => setFilters((f) => ({ ...f, trusts: draftTrusts }));

    const toggleType = (type) => {
        setDraftTypes((prev) => (prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]));
    };

    const toggleUtility = (utility) => {
        setDraftUtilities((prev) => (prev.includes(utility) ? prev.filter((u) => u !== utility) : [...prev, utility]));
    };

    const removeUtility = (utility) => {
        setDraftUtilities((prev) => prev.filter((u) => u !== utility));
        setFilters((f) => ({ ...f, utilities: f.utilities.filter((u) => u !== utility) }));
    };

    const clearAllFilters = () => {
        setDraftPrice([0, 20]);
        setDraftArea([0, 150]);
        setDraftTypes([]);
        setDraftUtilities([]);
        setDraftTrusts({ vip: false, verified: false, normal: true });
        setFilters(DEFAULT_FILTERS);
    };

    return {
        filters,
        setFilters,
        draftPrice,
        setDraftPrice,
        draftArea,
        setDraftArea,
        draftTypes,
        setDraftTypes,
        draftUtilities,
        setDraftUtilities,
        draftTrusts,
        setDraftTrusts,
        applyPrice,
        applyArea,
        applyTypes,
        applyUtilities,
        applyTrusts,
        toggleType,
        toggleUtility,
        removeUtility,
        clearAllFilters
    };
};
