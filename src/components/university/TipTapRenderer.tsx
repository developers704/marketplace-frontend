'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';
import FontFamily from '@tiptap/extension-font-family';
import Color from '@tiptap/extension-color';
import { useEffect, useState } from 'react';
import Lightbox from 'react-image-lightbox';
import 'react-image-lightbox/style.css';
import './TipTapRenderer.css';

interface TipTapRendererProps {
	content: string;
	className?: string;
}

/**
 * TipTapRenderer - Read-only TipTap content renderer
 * Renders TipTap HTML content with the same extensions as the admin editor
 * Provides professional, consistent styling matching the admin panel
 */
const TipTapRenderer: React.FC<TipTapRendererProps> = ({ content, className = '' }) => {
	const BASE_API = process.env.NEXT_PUBLIC_BASE_API || '';
	const [isOpen, setIsOpen] = useState<boolean>(false);
	const [photoIndex, setPhotoIndex] = useState(0);
	const [images, setImages] = useState<string[]>([]);

	// Helper function to get full image URL
	const getImageUrl = (src: string) => {
		if (!src) return '';
		if (src.startsWith('http://') || src.startsWith('https://')) {
			return src;
		}
		if (src.startsWith('/')) {
			return `${BASE_API}${src}`;
		}
		if (src.startsWith('data:')) {
			return src;
		}
		return `${BASE_API}/${src}`;
	};

	// Custom Image extension that handles image URLs
	const CustomImage = Image.extend({
		addAttributes() {
			return {
				...this.parent?.(),
				src: {
					default: null,
				},
				alt: {
					default: null,
				},
				title: {
					default: null,
				},
				width: {
					default: null,
				},
				height: {
					default: null,
				},
				align: {
					default: 'center',
				},
			};
		},
		renderHTML({ HTMLAttributes }) {
			const src = HTMLAttributes.src;
			const fullImageUrl = getImageUrl(src);

			return [
				'img',
				{
					...HTMLAttributes,
					src: fullImageUrl,
					class: 'tiptap-renderer-image cursor-pointer',
					'data-image-url': fullImageUrl,
				},
			];
		},
	});

	const editor = useEditor({
		extensions: [
			StarterKit.configure({
				heading: {
					levels: [1, 2, 3],
				},
				bulletList: {
					keepMarks: true,
					keepAttributes: false,
				},
				orderedList: {
					keepMarks: true,
					keepAttributes: false,
				},
			}),
			CustomImage.configure({
				inline: true,
				allowBase64: false,
				HTMLAttributes: {
					class: 'tiptap-renderer-image',
				},
			}),
			Underline,
			Link.configure({
				openOnClick: true,
				HTMLAttributes: {
					class: 'tiptap-renderer-link',
					target: '_blank',
					rel: 'noopener noreferrer',
				},
			}),
			TextAlign.configure({
				types: ['heading', 'paragraph'],
			}),
			TextStyle,
			FontFamily.configure({
				types: ['textStyle'],
			}),
			Color.configure({
				types: ['textStyle'],
			}),
		],
		content: content || '',
		editable: false, // Read-only mode
		immediatelyRender: false,
		editorProps: {
			attributes: {
				class: 'tiptap-renderer-content',
			},
		},
	});

	// Update content when prop changes
	useEffect(() => {
		if (editor && content !== editor.getHTML()) {
			editor.commands.setContent(content || '', false);
		}
	}, [content, editor]);

	// Handle image clicks for lightbox
	useEffect(() => {
		if (!editor) return;

		const handleImageClick = (e: MouseEvent) => {
			const target = e.target as HTMLElement;
			if (target.tagName === 'IMG' && target.classList.contains('tiptap-renderer-image')) {
				const imageUrl = target.getAttribute('data-image-url') || target.getAttribute('src') || '';
				const fullImageUrl = getImageUrl(imageUrl);
				
				if (fullImageUrl) {
					const currentIndex = images.indexOf(fullImageUrl);
					if (currentIndex >= 0) {
						setPhotoIndex(currentIndex);
					} else {
						// Add to images if not already there
						const newImages = [...images, fullImageUrl];
						setImages(newImages);
						setPhotoIndex(newImages.length - 1);
					}
					setIsOpen(true);
				}
			}
		};

		const editorElement = editor.view.dom;
		editorElement.addEventListener('click', handleImageClick);

		return () => {
			editorElement.removeEventListener('click', handleImageClick);
		};
	}, [editor, images]);

	// Extract images from content for lightbox
	useEffect(() => {
		if (!content) return;

		const tempDiv = document.createElement('div');
		tempDiv.innerHTML = content;
		const imgElements = tempDiv.querySelectorAll('img');

		const extractedImages: string[] = [];
		imgElements.forEach((img) => {
			const src = img.getAttribute('src');
			if (src) {
				const fullUrl = getImageUrl(src);
				if (fullUrl && !extractedImages.includes(fullUrl)) {
					extractedImages.push(fullUrl);
				}
			}
		});

		if (extractedImages.length > 0) {
			setImages(extractedImages);
		}
	}, [content]);

	if (!editor) {
		return (
			<div className={`tiptap-renderer-loading ${className}`}>
				<div className="animate-pulse">
					<div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
					<div className="h-4 bg-gray-200 rounded w-full mb-4"></div>
					<div className="h-4 bg-gray-200 rounded w-5/6"></div>
				</div>
			</div>
		);
	}

	return (
		<>
			<div className={`tiptap-renderer-wrapper ${className}`}>
				<EditorContent editor={editor} className="tiptap-renderer-editor" />
			</div>

			{/* Lightbox for images */}
			{isOpen && images.length > 0 && (
				<Lightbox
					mainSrc={images[photoIndex] || images[0]}
					nextSrc={images[(photoIndex + 1) % images.length]}
					prevSrc={images[(photoIndex + images.length - 1) % images.length]}
					onCloseRequest={() => setIsOpen(false)}
					onMovePrevRequest={() =>
						setPhotoIndex((photoIndex + images.length - 1) % images.length)
					}
					onMoveNextRequest={() =>
						setPhotoIndex((photoIndex + 1) % images.length)
					}
					animationDisabled={false}
					imageTitle={`Image ${photoIndex + 1} of ${images.length}`}
				/>
			)}
		</>
	);
};

export default TipTapRenderer;

