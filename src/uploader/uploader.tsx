import { RcFile, UploadFile } from "antd/es/upload";
import { SetStateAction, useEffect, useState } from "react";
import { Image, Upload } from "antd";
import {
	defaultVividImageTypes,
	defaultVividVideoTypes,
	pastedFileFormat,
	playableImageRender,
	playableUploadItemRender,
	setListOnUploadChange,
	testVividFile,
} from "./handler";
import { PlusOutlined } from "@ant-design/icons";
interface PreviewUploaderProps {
	oldFileList: Array<String>;
	disable?: boolean;
	maxCount?: number;
	vividImageTypes?: Array<string>;
	vividVideoTypes?: Array<string>;
	showWarning?: boolean;
	multiple?: boolean;
	directory?: boolean;
}

const PreviewUploader = ({
	oldFileList,
	disable = false,
	maxCount = 6,
	vividImageTypes = defaultVividImageTypes,
	vividVideoTypes = defaultVividVideoTypes,
	showWarning = true,
	multiple = true,
	directory = false,
}: PreviewUploaderProps) => {
	const [previewVisible, setPreviewVisible] = useState(false);
	const [filelist, setFilelist] = useState<Array<any>>([]);
	const [currentPreview, setCurrentPreview] = useState(1);
	const [hover, setHover] = useState(false);

	useEffect(() => {
		// console.log("hover", hover);
		const handlePaste = (event: ClipboardEvent) => {
			if (!hover) return;
			if (!event.clipboardData) return;
			const item = event.clipboardData.items[0];
			if (item.kind === "file") {
				let originfile = item.getAsFile();
				// 处理获取到的文件，可以将其存储到状态或进行其他操作
				let file = pastedFileFormat(originfile!);
				// console.log("Pasted File:", file);
				if (
					testVividFile(
						file,
						vividImageTypes,
						vividVideoTypes,
						showWarning
					)
				) {
					setListOnUploadChange(
						{ file: file, fileList: filelist.concat(file) },
						setFilelist
					);
				}
			}
		};

		document.addEventListener("paste", handlePaste);

		return () => {
			document.removeEventListener("paste", handlePaste);
		};
	}, [hover]);

	useEffect(() => {
		setFilelist(
			oldFileList.map((item) => ({
				uid: Math.random(), //映射uid，不然preview的时候会出错
				thumbUrl: item,
			}))
		);
	}, [oldFileList]);

	const handlePreview = (file: UploadFile) => {
		const resList = filelist.map((file) => {
			// console.log(file, 'file');
			file.src = file.thumbUrl;
			return file;
		});
		const current = filelist.findIndex((item) => item.uid === file.uid);
		setCurrentPreview(current);
		setFilelist(resList);
		setPreviewVisible(true);
	};

	const uploadButton = (
		<button style={{ border: 0, background: "none" }} type="button">
			<PlusOutlined />
			<div style={{ marginTop: 8 }}>Upload</div>
		</button>
	);

	return (
		<div
			onMouseEnter={() => setHover(true)}
			onMouseLeave={() => setHover(false)}
		>
			<Upload
				multiple={multiple}
				directory={directory}
				fileList={filelist}
				listType="picture-card"
				showUploadList={true}
				onPreview={handlePreview}
				// beforeUpload={(file)=>testVividFile(file,vividImageTypes,vividVideoTypes,showWarning)}
				customRequest={() => {}}
				itemRender={playableUploadItemRender}
				onChange={(uploadInfo) => {
					setListOnUploadChange(uploadInfo, setFilelist);
				}}
				disabled={disable}
				maxCount={maxCount}
			>
				{filelist.length >= maxCount ? null : uploadButton}
			</Upload>
			<Image.PreviewGroup
				items={filelist}
				preview={{
					onChange: (current: SetStateAction<number>) => {
						setCurrentPreview(current);
					},
					visible: previewVisible,
					onVisibleChange: (vis: boolean) => setPreviewVisible(vis),
					current: currentPreview,
					imageRender: playableImageRender,
				}}
			/>
		</div>
	);
};

export default PreviewUploader;
