import { Component, input, output, signal } from '@angular/core';

@Component({
  selector: 'app-image-upload',
  imports: [],
  templateUrl: './image-upload.html',
  styleUrl: './image-upload.css',
})
export class ImageUpload {
  protected imageSrc = signal<string | ArrayBuffer | null | undefined>(null);
  protected isDragging = false;
  private fileToUplaod: File | null = null;
  uploadFile = output<File>()
  loading = input<boolean>(false);

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;

    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      const file = event.dataTransfer.files[0];
      this.previewImage(file);
      this.fileToUplaod = file;
    }
  }

  private previewImage(file: File) {
    const reader = new FileReader();
    reader.onload = (e) => {
      this.imageSrc.set(e.target?.result);

    }
    reader.readAsDataURL(file);
  }

  onCancel() {
    this.imageSrc.set(null);
    this.fileToUplaod = null;
  }

  onUpload() {
    if (this.fileToUplaod) {
      this.uploadFile.emit(this.fileToUplaod);
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.previewImage(file);
      this.fileToUplaod = file;
    }
  }
}
