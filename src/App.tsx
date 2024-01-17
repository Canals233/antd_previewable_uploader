import PreviewUploader from "./previewable_uploader/uploader";
import AntdUpload from "./test/antd";


function App() {
    return <>
    <div>hello worold</div>
    <PreviewUploader oldFileList={[]} />
    <PreviewUploader oldFileList={[]} />
    <AntdUpload/>
    </>
}

export default App;
