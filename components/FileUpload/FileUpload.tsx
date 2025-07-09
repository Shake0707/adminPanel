import { ChangeEventHandler, Dispatch, SetStateAction, useState } from "react";
import classes from "./style.module.css";
import Image from "next/image";
import { addFileToFileList } from "@/utils/FileList";

interface IProps {
    setFiles: Dispatch<SetStateAction<FileList | null>>;
    files: FileList | null;
}

let added: boolean = false;

export default function FileUpload({ setFiles, files }: IProps) {
    const [imageUrl, setImageUrl] = useState<string>("");
    const [showInput, setIsShowInput] = useState<boolean>(true);

    // console.log(files);

    const handleChange: ChangeEventHandler<HTMLInputElement> = e => {
        const files = e.target.files;

        added = false;
        if (!files) {
            setFiles(files);
            added = true;
        }

        if(!files) return;

        for (let i = 0; i < files.length; i++) {
            if (files && !added) {
                setFiles(addFileToFileList(files, files[i]));
            }
            setImageUrl(URL.createObjectURL(files[i]));
        }

        setIsShowInput(false);
    }

    const handleDelete = () => {
        setImageUrl("");
        setIsShowInput(true);
        files = null;
    }

    return (
        <div className={classes.uploadImages}>

            {!showInput ? (
                <div className={classes.item}>
                    <Image
                        src={imageUrl}
                        width={0}
                        height={0}
                        sizes="100%"
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        alt="Picture"
                    />
                    <div className={classes.delete} onClick={handleDelete}></div>
                </div>
            ) : ""}

            {
                showInput ?
                    <div className={classes.item + " " + classes.upload}>
                        <label>
                            <span className={classes.icon}>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512">
                                    <path d="M144 480C64.5 480 0 415.5 0 336c0-62.8 40.2-116.2 96.2-135.9c-.1-2.7-.2-5.4-.2-8.1c0-88.4 71.6-160 160-160c59.3 0 111 32.2 138.7 80.2C409.9 102 428.3 96 448 96c53 0 96 43 96 96c0 12.2-2.3 23.8-6.4 34.6C596 238.4 640 290.1 640 352c0 70.7-57.3 128-128 128l-368 0zm79-217c-9.4 9.4-9.4 24.6 0 33.9s24.6 9.4 33.9 0l39-39L296 392c0 13.3 10.7 24 24 24s24-10.7 24-24l0-134.1 39 39c9.4 9.4 24.6 9.4 33.9 0s9.4-24.6 0-33.9l-80-80c-9.4-9.4-24.6-9.4-33.9 0l-80 80z" />
                                </svg>
                            </span>
                            <span className={classes.text}>
                                Select your<span> image</span>
                            </span>
                            <input type="file" accept="image/*" onChange={handleChange} />
                        </label>
                    </div>
                    : ""
            }

        </div>
    )
}
