import React, {SyntheticEvent} from "react";
import {uploadImage} from "../../../../common/functions/UpfileFunc";

interface IProps {
    defaultValue?: string
    onChange: (event: SyntheticEvent<HTMLInputElement>) => any
}

const ReactSummernote = require("react-summernote").default;

export default class RickTextEditor extends React.Component<IProps, any> {
    reactSummernoteRef = React.createRef<any>();

    setDefaultValue(value: string) {
        if (this.reactSummernoteRef.current) {
            this.reactSummernoteRef.current.reset();
            const divEl = document.createElement("div");
            divEl.innerHTML = value;
            this.reactSummernoteRef.current.insertNode(divEl);
        }
    }

    render() {
        return <ReactSummernote
            ref={this.reactSummernoteRef}
            required={true}
            options={{
                lang: 'vn',
                height: 200,
                dialogsInBody: true,
                toolbar: [
                    ['font', ['bold', 'underline', 'clear']],
                    ['fontsize', ['fontsize']],
                    ['fontname', ['fontname']],
                    ['para', ['ul', 'ol', 'paragraph']],
                    ['view', ['fullscreen', 'codeview']],
                    ['color', ['color']],
                    ['insert', ['link', 'picture', 'video']],
                ]
            }}
            onImageUpload={(files: FileList) => {
                const reader = new FileReader();
                reader.onloadend = async () => {
                    const {url} = await uploadImage(files, "uploadCover");
                    ReactSummernote.insertImage(url);
                };
                reader.readAsDataURL(files[0]);
            }}
            onChange={(e: string) => this.props.onChange({currentTarget: {value: e}} as SyntheticEvent<HTMLInputElement>)}
        />;
    }

    componentDidMount() {
        this.setDefaultValue(this.props.defaultValue || "");
    }

    componentDidUpdate(prevProps: Readonly<IProps>, prevState: Readonly<any>, snapshot?: any) {
        if (prevProps.defaultValue !== this.props.defaultValue && this.reactSummernoteRef.current) {
            this.setDefaultValue(this.props.defaultValue || "");
        }
    }
}