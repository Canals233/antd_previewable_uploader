import { message } from "antd";
import React from "react";

const defaultVividImageTypes = ["image/jpeg", "image/png"];
const defaultVividVideoTypes = [
	"video/mp4",
	"video/avi",
	"video/mov",
	"video/wmv",
	"video/flv",
	"video/quicktime",
	"video/x-ms-wmv",
	"video/webm",
];
const playableVideoTypes = ["video/mp4", "video/webm"];

function checkVideoSrc(src: string) {
	// console.log(src, 'src');
	var ext = src?.split(".").pop();
	switch (ext) {
		case "flv":
		case "mp":
		case "avi":
		case "wmv":
		case "mov":
		case "mp4":
			return true;
		default:
			return false;
	}
}

function checkNeedMP4(src: string) {
	var ext = src?.split(".").pop();
	switch (ext) {
		case "flv":
		case "avi":
		case "wmv":
		case "mov":
			return true;
		default:
			return false;
	}
}

const CheckExist = (fileList: any[], file: any) => {
	//检查文件是否已经存在
	let filtedList = fileList.filter((arrFile) => arrFile.uid !== file.uid);
	return filtedList.some(
		(arrayFile) =>
			file.lastModified === arrayFile.lastModified &&
			file.name === arrayFile.name &&
			file.size === arrayFile.size &&
			file.type === arrayFile.type
	);
};

type testVividFileOptionProps = {
	vividImageTypes?: string[];
	vividVideoTypes?: string[];
	showWarning?: boolean;
	maxSize?: number;
	minSize?: number;
	fileTypeWarning?: string;
	fileSizeWarning?: string;
	enableflv?: boolean;
};

const testVividFile = (file: any, options: testVividFileOptionProps) => {
	const {
		vividImageTypes = defaultVividImageTypes,
		vividVideoTypes = defaultVividVideoTypes,
		showWarning = true,
		maxSize = 1024 * 1024 * 50,
		minSize = 0,
		fileTypeWarning = "仅支持图片、视频文件 图片仅支持：JPG、PNG格式 视频仅支持：mp4、flv、avi、wmv、mov格式 ",
		fileSizeWarning = "文件过大",
		enableflv = true,
	} = options;
	//测试文件是否符合要求

	const isJpgOrPng = vividImageTypes.includes(file.type);
	const isVideo =
		vividVideoTypes.includes(file.type) ||
		(enableflv && file.name?.endsWith("flv"));
	const isvividSize = file.size < maxSize || file.size > minSize;
	console.log(file, maxSize, minSize);
	if (showWarning) {
		if (!isJpgOrPng && !isVideo) {
			message.error(fileTypeWarning);
		} else if (!isvividSize) {
			message.error(fileSizeWarning);
		}
	}
	return (isJpgOrPng || isVideo) && isvividSize;
};

const getDisplayableFileList = (
	rawList: any[],
	testOptions?: testVividFileOptionProps
) => {
	const fileList = rawList
		.filter((file) => {
			//进行过滤，控制上传文件是否有效
			// console.log(file, "filter file");
			if (file.alreadyExist) return false;
			if (file.thumbUrl?.startsWith("http")) return true;
			return testVividFile(file, testOptions || {});
		})
		.map((file) => {
			//进行转换，将上传的文件转换成可展示的文件
			// console.log(file, "map file");
			const url = file.thumbUrl || file.url;
			file.status = "done"; //这里设置done才能显示图片，否则会显示loading进度条
			file.src = file.thumbUrl;
			if (url?.startsWith("http")) {
				if (checkNeedMP4(url)) {
					//服务端转码MP4后的文件，视频文件后缀名不一定是mp4，所以需要加上.mp4后缀
					file.thumbUrl = url + ".mp4";
				}
				return file;
			}
			file.thumbUrl = URL.createObjectURL(file.originFileObj);
			//创建一个blob url，这个url可以直接用于video的src
			if (file.type?.includes("video") || file.name?.endsWith("flv")) {
				//加上tag，用于区分是video还是image
				if (playableVideoTypes.includes(file.type)) {
					//如果是mp4或者webm,
					file.thumbUrl += "#playvideo";
				} else {
					file.thumbUrl += "#video";
				}
			} else if (file.type?.includes("image")) {
				file.thumbUrl += "#image";
			}

			return file;
		});
	// console.log(fileList, "dis fileList");
	return fileList;
};

const setListOnUploadChange = (
	{ fileList, file }: any,
	setUploadFileList: Function,
	testOptions?: testVividFileOptionProps
) => {
	if (CheckExist(fileList, file)) {
		message.warning(`${file.name}已存在`);
		file.alreadyExist = true;
	}
	// console.log(file, "file", fileList, "fileList");

	const resList = getDisplayableFileList(fileList, testOptions);

	setUploadFileList(resList);
};

//这个是在image.previewGroup里面的imageRender
const playableImageRender = (originNode: any, _info: any) => {
	// console.log(originNode,'image');
	let url: string = originNode?.props?.src;
	let [src, type] = url?.split("#") || [];
	if (url?.includes("blob")) {
		//存在blob，说明是上传的文件，而不是远程的url
		if (type === "playvideo") {
            //可直接播放的视频
			return (
				<video
					key={Math.random()}
					width={"100%"}
					height={"80%"}
					src={url}
					controls
				/>
			);
		} else if (type === "video") {
			return (
				<div key={Math.random()} style={{ textAlign: "center" }}>
					此视频格式在上传转码后才可播放
				</div>
			);
		} else if (type === "image") {
			return originNode;
		}
	} else if (checkVideoSrc(url)) {
		//远程url情况,除了本来就是mp4的，其他的都加上.mp4后缀
		if (checkNeedMP4(url)) url = url + ".mp4";
		return (
			<video
				key={Math.random()}
				width={"100%"}
				height={"80%"}
				src={url}
				controls
			/>
		);
	} else return originNode;
};

//这个是在Upload里面的itemRender
const playableUploadItemRender = (
	originNode: any,
	file: any,
	_fileList: any,
	_actions: any
) => {
	//覆盖掉antd返回的vdom的第一个子节点，就是展示图片的那个节点
	let remoteUrl: string = file?.thumbUrl;
	// console.log(originNode, file);
	if (file?.type?.includes("video") || file?.name?.endsWith("flv")) {
		//存在type，说明是上传的文件，而不是远程的url
		if (playableVideoTypes.includes(file.type)) {
			const url = file.thumbUrl;
			const newNode = React.cloneElement(originNode, {
				children: [
					<video
						key={Math.random()}
						width={85}
						height={80}
						src={url}
					/>,
					...originNode.props.children.slice(1),
				],
			});
			return newNode;
		} else {
			const newNode = React.cloneElement(originNode, {
				children: [
					<div key={Math.random()} style={{ textAlign: "center" }}>
						此视频格式在上传转码后才可播放
					</div>,
					...originNode.props.children.slice(1), // 保留其他子元素
				],
			});
			return newNode;
		}
	} else if (remoteUrl?.includes("video") || checkVideoSrc(remoteUrl)) {
		//远程url情况,除了本来就是mp4的，其他的都加上.mp4后缀
		if (checkNeedMP4(remoteUrl)) remoteUrl = remoteUrl + ".mp4";
		return React.cloneElement(originNode, {
			children: [
				<video
					key={Math.random()}
					width={85}
					height={80}
					src={remoteUrl}
				/>,
				...originNode.props.children.slice(1), // 保留其他子元素
			],
		});
	}
	return originNode;
};

const pastedFileFormat = (file: File) => {
	const rcFile = {
		uid: String(Date.now()), // 为确保唯一性，你可以根据需求设置一个唯一的 uid
		size: file.size,
		name: file.name,
		type: file.type,
		lastModified: file.lastModified,
		originFileObj: file,
	};

	return rcFile;
};

export {
	defaultVividImageTypes,
	defaultVividVideoTypes,
	playableVideoTypes,
	testVividFile,
	setListOnUploadChange,
	getDisplayableFileList,
	playableImageRender,
	playableUploadItemRender,
	pastedFileFormat,
};
