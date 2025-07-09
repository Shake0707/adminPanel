import Pagination from '@mui/material/Pagination';
import classes from "./style.module.css";
import { useRouter, useSearchParams } from 'next/navigation';
import { ChangeEvent, useState } from 'react';

interface IProps {
    count: number;
}

export default function Pagenation({ count }: IProps) {
    const searchParams = useSearchParams();
    const router = useRouter();

    //! FOR RESET
    const [pageCount, setPageCount] = useState<number>(1);

    const handleChange = (event: ChangeEvent<unknown>, page: number) => {
        const params = new URLSearchParams(searchParams);
        params.set("page", page.toString());
        router.push(`?${params.toString()}`);
        setPageCount(page);
    }

    return (
        <Pagination
            count={count}
            page={pageCount}
            shape='rounded'
            className={classes.pagenation}
            onChange={handleChange}
            showFirstButton
            showLastButton
            sx={{
                bgcolor: "white"
            }}
        />
    )
}
