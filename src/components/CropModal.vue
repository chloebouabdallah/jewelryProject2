<template>
  <div v-if="show" class="fixed inset-0 z-[200] flex items-center justify-center px-4">
    <!-- Backdrop -->
    <div class="absolute inset-0 bg-black/70" @click="cancelCrop"></div>
    
    <!-- Modal -->
    <div class="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-fade-scale">
      <h3 class="text-xl font-playfair font-semibold text-stone-800 mb-4">Crop Profile Photo</h3>
      
      <!-- Cropper Container -->
      <div class="relative w-full aspect-square bg-stone-100 rounded-lg overflow-hidden">
        <img 
          ref="imageRef"
          :src="image" 
          alt="Crop"
          class="max-w-full max-h-full"
          @load="onImageLoad"
        >
      </div>
      
      <div class="flex gap-3 mt-4">
        <button 
          @click="cancelCrop" 
          class="flex-1 border border-stone-300 text-stone-600 py-2 rounded-lg hover:bg-stone-50 transition"
        >
          Cancel
        </button>
        <button 
          @click="applyCrop" 
          class="flex-1 bg-amber-600 hover:bg-amber-700 text-white py-2 rounded-lg transition font-medium"
        >
          <i class="fas fa-check mr-2"></i> Apply
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick, onBeforeUnmount } from 'vue'
import Cropper from 'cropperjs'

// Load CSS from CDN
const loadCropperCSS = () => {
  if (!document.querySelector('#cropper-css')) {
    const link = document.createElement('link')
    link.id = 'cropper-css'
    link.rel = 'stylesheet'
    link.href = 'https://cdn.jsdelivr.net/npm/cropperjs@1.6.2/dist/cropper.min.css'
    document.head.appendChild(link)
    console.log('✅ Cropper CSS loaded')
  }
}
loadCropperCSS()

const props = defineProps({
  image: {
    type: String,
    required: true
  },
  show: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['crop', 'cancel'])

const imageRef = ref(null)
let cropperInstance = null
let isCropperReady = false

const onImageLoad = () => {
  console.log('🖼️ Image loaded in cropper')
  nextTick(() => {
    initCropper()
  })
}

// Initialize cropper when modal opens
watch(() => props.show, (newVal) => {
  console.log('🔄 CropModal show changed:', newVal)
  if (newVal) {
    nextTick(() => {
      if (imageRef.value && imageRef.value.complete) {
        initCropper()
      } else if (imageRef.value) {
        imageRef.value.onload = () => {
          initCropper()
        }
      }
    })
  } else {
    destroyCropper()
  }
})

const initCropper = () => {
  if (!imageRef.value) {
    console.log('❌ No image ref found')
    return
  }
  
  destroyCropper()
  
  console.log('🔄 Initializing cropper with image:', props.image.substring(0, 50) + '...')
  
  try {
    cropperInstance = new Cropper(imageRef.value, {
      viewMode: 1,
      dragMode: 'move',
      aspectRatio: 1,
      autoCropArea: 0.8,
      restore: false,
      guides: true,
      center: true,
      highlight: false,
      cropBoxMovable: true,
      cropBoxResizable: true,
      toggleDragModeOnDblclick: false,
      background: false,
      modal: true,
      movable: true,
      rotatable: false,
      scalable: false,
      zoomable: true,
      zoomOnTouch: true,
      zoomOnWheel: true,
      wheelZoomRatio: 0.1
    })
    isCropperReady = true
    console.log('✅ Cropper initialized successfully')
  } catch (error) {
    console.error('❌ Error initializing cropper:', error)
  }
}

const destroyCropper = () => {
  if (cropperInstance) {
    try {
      cropperInstance.destroy()
      console.log('🗑️ Cropper destroyed')
    } catch (e) {
      console.log('Error destroying cropper:', e)
    }
    cropperInstance = null
    isCropperReady = false
  }
}

const applyCrop = () => {
  console.log('✂️ Apply crop clicked, cropper ready:', isCropperReady)
  
  if (!cropperInstance) {
    console.log('❌ No cropper instance')
    alert('Please wait for the image to load')
    return
  }
  
  try {
    const croppedCanvas = cropperInstance.getCroppedCanvas({
      width: 400,
      height: 400,
      imageSmoothingQuality: 'high'
    })
    
    if (!croppedCanvas) {
      console.log('❌ Failed to get cropped canvas')
      return
    }
    
    const croppedImage = croppedCanvas.toDataURL('image/jpeg', 0.9)
    console.log('✅ Crop applied, image length:', croppedImage.length)
    emit('crop', croppedImage)
    destroyCropper()
  } catch (error) {
    console.error('❌ Error applying crop:', error)
    alert('Error cropping image. Please try again.')
  }
}

const cancelCrop = () => {
  console.log('❌ Crop cancelled')
  destroyCropper()
  emit('cancel')
}

onBeforeUnmount(() => {
  destroyCropper()
})
</script>

<style scoped>
.animate-fade-scale {
  animation: fadeScale 0.2s ease-out;
}

@keyframes fadeScale {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

:deep(.cropper-view-box) {
  border-radius: 50%;
  box-shadow: 0 0 0 1px #b8926c;
}

:deep(.cropper-face) {
  background-color: transparent !important;
}

:deep(.cropper-line) {
  background-color: #b8926c;
}

:deep(.cropper-point) {
  background-color: #b8926c;
}

:deep(.cropper-point.point-se) {
  background-color: #b8926c;
}

:deep(.cropper-dashed) {
  border-color: rgba(255, 255, 255, 0.5);
}

:deep(.cropper-modal) {
  background-color: rgba(0, 0, 0, 0.5);
}
</style>