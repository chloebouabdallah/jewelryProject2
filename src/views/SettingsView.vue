<template>
  <main class="pt-32 pb-20 px-5">
    <div class="max-w-4xl mx-auto">
      
      <!-- Page Title -->
      <div class="text-center mb-12">
        <h1 class="font-playfair text-4xl md:text-5xl font-light text-stone-800 mb-3">Account Settings</h1>
        <div class="w-20 h-0.5 bg-amber-500 mx-auto rounded-full"></div>
        <p class="text-stone-600 mt-4">Manage your account preferences and profile</p>
      </div>
      
      <!-- Check if user is logged in -->
      <div v-if="!authStore.isAuthenticated" class="bg-white rounded-2xl shadow-md p-8 text-center">
        <i class="fas fa-lock text-5xl text-amber-400 mb-4"></i>
        <h2 class="text-xl font-semibold text-stone-800 mb-2">Please Login</h2>
        <p class="text-stone-600 mb-6">You need to be logged in to access your settings.</p>
        <button @click="authStore.openAuthModal('login')" class="bg-amber-600 text-white px-6 py-2 rounded-full hover:bg-amber-700 transition">
          Login
        </button>
      </div>
      
      <!-- Settings Content -->
      <div v-else class="space-y-6">
        
        <!-- Profile Section -->
        <div class="bg-white rounded-2xl shadow-md p-6">
          <div class="flex flex-col md:flex-row items-center gap-6">
            <!-- Profile Picture -->
            <div class="flex flex-col items-center gap-3">
              <div class="relative group">
                <div 
                  class="w-28 h-28 rounded-full overflow-hidden border-4 border-amber-200 bg-amber-50 flex items-center justify-center"
                  :class="{ 'opacity-50': isUploading }"
                >
                  <img 
                    v-if="profileImage" 
                    :src="profileImage" 
                    alt="Profile" 
                    class="w-full h-full object-cover"
                  >
                  <i v-else class="fas fa-user text-5xl text-amber-400"></i>
                </div>
                <!-- Upload Overlay -->
                <div 
                  class="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer"
                  @click="triggerFileUpload"
                >
                  <div class="text-center text-white">
                    <i class="fas fa-camera text-2xl"></i>
                    <p class="text-[10px] mt-1">Change Photo</p>
                  </div>
                </div>
                <div v-if="isUploading" class="absolute inset-0 rounded-full bg-black/60 flex items-center justify-center">
                  <i class="fas fa-spinner fa-spin text-2xl text-white"></i>
                </div>
              </div>
              
              <input 
                type="file" 
                ref="fileInput" 
                accept="image/*"
                class="hidden"
                @change="handleFileSelect"
              >
              
              <button 
                v-if="profileImage" 
                @click="removeProfileImage" 
                class="text-xs text-red-500 hover:text-red-700 transition"
              >
                <i class="fas fa-trash-alt mr-1"></i> Remove Photo
              </button>
              
              <p class="text-[10px] text-stone-400">JPG, PNG or WEBP (Max 5MB)</p>
            </div>
            
            <!-- User Info -->
            <div class="flex-1 text-center md:text-left">
              <h2 class="text-2xl font-playfair font-semibold text-stone-800">
                {{ authStore.currentUser?.name || authStore.currentUser?.email?.split('@')[0] }}
              </h2>
              <p class="text-stone-500">{{ authStore.currentUser?.email }}</p>
              <span class="inline-block mt-1 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                {{ authStore.currentUser?.provider || 'Email' }}
              </span>
            </div>
          </div>
        </div>
        
        <!-- Edit Profile Section -->
        <div class="bg-white rounded-2xl shadow-md p-6">
          <h3 class="font-playfair text-xl font-semibold text-stone-800 mb-4 flex items-center gap-2">
            <i class="fas fa-edit text-amber-600"></i> Edit Profile
          </h3>
          
          <form @submit.prevent="updateProfile" class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-stone-700 text-sm mb-2">Full Name</label>
                <input 
                  type="text" 
                  v-model="editForm.name" 
                  class="w-full px-4 py-2 border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-400 focus:outline-none"
                  placeholder="Your name"
                >
              </div>
              <div>
                <label class="block text-stone-700 text-sm mb-2">Email Address</label>
                <input 
                  type="email" 
                  v-model="editForm.email" 
                  disabled
                  class="w-full px-4 py-2 border border-stone-200 rounded-lg bg-stone-50 text-stone-500 cursor-not-allowed"
                >
              </div>
              <div>
                <label class="block text-stone-700 text-sm mb-2">Phone Number</label>
                <input 
                  type="tel" 
                  v-model="editForm.phone" 
                  class="w-full px-4 py-2 border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-400 focus:outline-none"
                  placeholder="+961 3 123 456"
                >
              </div>
              <div>
                <label class="block text-stone-700 text-sm mb-2">Location</label>
                <input 
                  type="text" 
                  v-model="editForm.location" 
                  class="w-full px-4 py-2 border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-400 focus:outline-none"
                  placeholder="Beirut, Lebanon"
                >
              </div>
            </div>
            
            <button type="submit" class="bg-amber-600 hover:bg-amber-700 text-white px-6 py-2 rounded-full transition font-medium text-sm">
              <i class="fas fa-save mr-2"></i> Save Changes
            </button>
          </form>
        </div>
        
        <!-- Change Password Section -->
        <div class="bg-white rounded-2xl shadow-md p-6">
          <h3 class="font-playfair text-xl font-semibold text-stone-800 mb-4 flex items-center gap-2">
            <i class="fas fa-key text-amber-600"></i> Change Password
          </h3>
          
          <form @submit.prevent="handleChangePassword" class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-stone-700 text-sm mb-2">Current Password</label>
                <div class="relative">
                  <input 
                    :type="showCurrentPassword ? 'text' : 'password'"
                    v-model="passwordForm.currentPassword"
                    required
                    class="w-full px-4 py-2 pr-10 border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-400 focus:outline-none"
                    placeholder="Enter current password"
                  >
                  <button 
                    type="button"
                    @click="showCurrentPassword = !showCurrentPassword"
                    class="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                  >
                    <i :class="showCurrentPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                  </button>
                </div>
              </div>
              <div>
                <label class="block text-stone-700 text-sm mb-2">New Password</label>
                <div class="relative">
                  <input 
                    :type="showNewPassword ? 'text' : 'password'"
                    v-model="passwordForm.newPassword"
                    required
                    minlength="6"
                    class="w-full px-4 py-2 pr-10 border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-400 focus:outline-none"
                    placeholder="Enter new password (min 6 characters)"
                  >
                  <button 
                    type="button"
                    @click="showNewPassword = !showNewPassword"
                    class="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                  >
                    <i :class="showNewPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                  </button>
                </div>
                <div class="mt-1 flex items-center gap-2">
                  <div class="flex-1 h-1 bg-stone-200 rounded-full overflow-hidden">
                    <div 
                      class="h-full transition-all duration-300 rounded-full"
                      :class="passwordStrengthClass"
                      :style="{ width: passwordStrength + '%' }"
                    ></div>
                  </div>
                  <span class="text-xs text-stone-500">{{ passwordStrengthLabel }}</span>
                </div>
              </div>
              <div>
                <label class="block text-stone-700 text-sm mb-2">Confirm New Password</label>
                <div class="relative">
                  <input 
                    :type="showConfirmPassword ? 'text' : 'password'"
                    v-model="passwordForm.confirmPassword"
                    required
                    minlength="6"
                    class="w-full px-4 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-amber-400 focus:outline-none"
                    :class="confirmPasswordClass"
                    placeholder="Confirm new password"
                  >
                  <button 
                    type="button"
                    @click="showConfirmPassword = !showConfirmPassword"
                    class="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                  >
                    <i :class="showConfirmPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                  </button>
                </div>
                <p v-if="passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword" class="text-red-500 text-xs mt-1">
                  <i class="fas fa-exclamation-circle mr-1"></i> Passwords do not match
                </p>
                <p v-if="passwordForm.confirmPassword && passwordForm.newPassword === passwordForm.confirmPassword && passwordForm.newPassword.length >= 6" class="text-green-500 text-xs mt-1">
                  <i class="fas fa-check-circle mr-1"></i> Passwords match
                </p>
              </div>
            </div>
            
            <div v-if="passwordError" class="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm">
              <i class="fas fa-exclamation-circle mr-2"></i> {{ passwordError }}
            </div>
            
            <div v-if="passwordSuccess" class="bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded-lg text-sm">
              <i class="fas fa-check-circle mr-2"></i> {{ passwordSuccess }}
            </div>
            
            <button 
              type="submit" 
              :disabled="isChangingPassword || !isPasswordFormValid"
              class="bg-amber-600 hover:bg-amber-700 disabled:bg-amber-300 disabled:cursor-not-allowed text-white px-6 py-2 rounded-full transition font-medium text-sm"
            >
              <i v-if="isChangingPassword" class="fas fa-spinner fa-spin mr-2"></i>
              <i v-else class="fas fa-key mr-2"></i>
              {{ isChangingPassword ? 'Changing Password...' : 'Change Password' }}
            </button>
          </form>
        </div>
        
        <!-- Preferences Section -->
        <div class="bg-white rounded-2xl shadow-md p-6">
          <h3 class="font-playfair text-xl font-semibold text-stone-800 mb-4 flex items-center gap-2">
            <i class="fas fa-sliders-h text-amber-600"></i> Preferences
          </h3>
          
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-stone-800 font-medium">Email Newsletter</p>
                <p class="text-stone-500 text-sm">Receive updates about new collections and offers</p>
              </div>
              <button 
                @click="preferences.newsletter = !preferences.newsletter"
                class="w-12 h-6 rounded-full transition relative flex-shrink-0"
                :class="preferences.newsletter ? 'bg-amber-600' : 'bg-stone-300'"
              >
                <span class="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition"
                  :class="preferences.newsletter ? 'translate-x-6' : 'translate-x-0'"
                ></span>
              </button>
            </div>
            
            <div class="flex items-center justify-between border-t border-amber-100 pt-4">
              <div>
                <p class="text-stone-800 font-medium">Dark Mode</p>
                <p class="text-stone-500 text-sm">Switch to dark theme</p>
              </div>
              <button 
                @click="preferences.darkMode = !preferences.darkMode"
                class="w-12 h-6 rounded-full transition relative flex-shrink-0"
                :class="preferences.darkMode ? 'bg-amber-600' : 'bg-stone-300'"
              >
                <span class="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition"
                  :class="preferences.darkMode ? 'translate-x-6' : 'translate-x-0'"
                ></span>
              </button>
            </div>
            
            <div class="flex items-center justify-between border-t border-amber-100 pt-4">
              <div>
                <p class="text-stone-800 font-medium">Preferred Currency</p>
                <p class="text-stone-500 text-sm">Display prices in your preferred currency</p>
              </div>
              <select v-model="preferences.currency" class="border border-amber-200 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-amber-400 focus:outline-none">
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="LBP">LBP (ل.ل)</option>
              </select>
            </div>
          </div>
        </div>
        
        <!-- Account Actions -->
        <div class="bg-white rounded-2xl shadow-md p-6 border border-red-100">
          <h3 class="font-playfair text-xl font-semibold text-stone-800 mb-4 flex items-center gap-2">
            <i class="fas fa-exclamation-triangle text-red-500"></i> Account Actions
          </h3>
          <div class="flex flex-wrap gap-3">
            <button 
              @click="authStore.logout" 
              class="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-full transition text-sm font-medium"
            >
              <i class="fas fa-sign-out-alt mr-2"></i> Logout
            </button>
          </div>
        </div>
        
      </div>
      
    </div>
  </main>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useScrollAnimation } from '@/composables/useScrollAnimation'

const authStore = useAuthStore()
useScrollAnimation()

// State
const fileInput = ref(null)
const profileImage = ref(null)
const isUploading = ref(false)

// Password Form
const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const showCurrentPassword = ref(false)
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)
const isChangingPassword = ref(false)
const passwordError = ref('')
const passwordSuccess = ref('')

// Edit Form
const editForm = ref({
  name: '',
  email: '',
  phone: '',
  location: ''
})

// Preferences
const preferences = ref({
  newsletter: true,
  darkMode: false,
  currency: 'USD'
})

// Password strength computed
const passwordStrength = computed(() => {
  const pwd = passwordForm.value.newPassword
  if (!pwd) return 0
  
  let score = 0
  if (pwd.length >= 6) score += 20
  if (pwd.length >= 8) score += 20
  if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) score += 20
  if (/\d/.test(pwd)) score += 20
  if (/[^a-zA-Z0-9]/.test(pwd)) score += 20
  
  return Math.min(score, 100)
})

const passwordStrengthLabel = computed(() => {
  const score = passwordStrength.value
  if (score === 0) return 'None'
  if (score < 30) return 'Weak'
  if (score < 60) return 'Fair'
  if (score < 80) return 'Good'
  return 'Strong'
})

const passwordStrengthClass = computed(() => {
  const score = passwordStrength.value
  if (score === 0) return 'bg-stone-200'
  if (score < 30) return 'bg-red-500'
  if (score < 60) return 'bg-yellow-500'
  if (score < 80) return 'bg-blue-500'
  return 'bg-green-500'
})

const confirmPasswordClass = computed(() => {
  if (!passwordForm.value.confirmPassword) return 'border-amber-200'
  if (passwordForm.value.newPassword === passwordForm.value.confirmPassword) return 'border-green-500'
  return 'border-red-500'
})

const isPasswordFormValid = computed(() => {
  return passwordForm.value.currentPassword.length >= 6 &&
         passwordForm.value.newPassword.length >= 6 &&
         passwordForm.value.confirmPassword.length >= 6 &&
         passwordForm.value.newPassword === passwordForm.value.confirmPassword
})

// Load user data on mount
onMounted(() => {
  loadUserData()
})

const loadUserData = () => {
  const user = authStore.currentUser
  if (user) {
    editForm.value.name = user.name || ''
    editForm.value.email = user.email || ''
    
    // Load saved preferences
    const savedPrefs = localStorage.getItem('soutou_preferences')
    if (savedPrefs) {
      try {
        preferences.value = { ...preferences.value, ...JSON.parse(savedPrefs) }
      } catch (e) {}
    }
    
    // Load profile image from localStorage
    const savedImage = localStorage.getItem('soutou_profile_image')
    if (savedImage && savedImage.startsWith('data:image')) {
      profileImage.value = savedImage
      console.log('✅ Profile image loaded from localStorage')
    } else {
      profileImage.value = null
      console.log('ℹ️ No profile image found')
    }
    
    // Load saved profile
    const savedProfile = localStorage.getItem('soutou_profile')
    if (savedProfile) {
      try {
        const profile = JSON.parse(savedProfile)
        editForm.value.phone = profile.phone || ''
        editForm.value.location = profile.location || ''
        if (profile.name) {
          editForm.value.name = profile.name
        }
      } catch (e) {}
    }
  }
}

// Profile Image Functions
const triggerFileUpload = () => {
  console.log('📷 Triggering file upload')
  fileInput.value.click()
}

const handleFileSelect = (event) => {
  const file = event.target.files[0]
  if (!file) {
    console.log('❌ No file selected')
    return
  }
  
  console.log('📁 File selected:', file.name, file.type, (file.size / 1024).toFixed(2) + 'KB')
  
  // Validate file type
  if (!file.type.startsWith('image/')) {
    alert('Please select an image file.')
    return
  }
  
  // Validate file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    alert('Image size must be less than 5MB. Your file is ' + (file.size / 1024 / 1024).toFixed(2) + 'MB.')
    return
  }
  
  // Show loading state
  isUploading.value = true
  
  // Read file and save directly (no cropping)
  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const imageDataUrl = e.target.result
      console.log('📸 Image loaded, saving to localStorage...')
      
      // Save to localStorage
      localStorage.setItem('soutou_profile_image', imageDataUrl)
      
      // Update display
      profileImage.value = imageDataUrl
      
      console.log('✅ Profile image saved successfully! Length:', imageDataUrl.length)
      
      // Verify it was saved
      const verify = localStorage.getItem('soutou_profile_image')
      if (verify) {
        console.log('✅ Verified: Image is in localStorage')
        alert('✅ Profile photo updated successfully!')
      } else {
        console.log('❌ Verification failed')
        alert('⚠️ Error saving image. Please try again.')
      }
      
    } catch (error) {
      console.error('❌ Error saving image:', error)
      alert('Error saving image. Please try again.')
    } finally {
      isUploading.value = false
    }
  }
  
  reader.onerror = (e) => {
    console.error('❌ Error reading file:', e)
    isUploading.value = false
    alert('Error reading file. Please try again.')
  }
  
  reader.readAsDataURL(file)
  
  // Reset input
  event.target.value = ''
}

const removeProfileImage = () => {
  if (confirm('Are you sure you want to remove your profile photo?')) {
    profileImage.value = null
    localStorage.removeItem('soutou_profile_image')
    console.log('🗑️ Profile image removed')
    alert('✅ Profile photo removed.')
  }
}

// Update Profile
const updateProfile = () => {
  console.log('💾 Saving profile...')
  
  const profileData = {
    name: editForm.value.name,
    phone: editForm.value.phone,
    location: editForm.value.location
  }
  localStorage.setItem('soutou_profile', JSON.stringify(profileData))
  
  if (authStore.currentUser) {
    authStore.currentUser.name = editForm.value.name
    authStore.saveToLocalStorage()
  }
  
  console.log('✅ Profile saved')
  alert('✅ Profile updated successfully!')
}

// ============================================
// CHANGE PASSWORD - FIXED
// ============================================
const handleChangePassword = async () => {
  // Clear previous messages
  passwordError.value = ''
  passwordSuccess.value = ''
  
  // Validate passwords match
  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    passwordError.value = 'New passwords do not match.'
    return
  }
  
  // Validate password length
  if (passwordForm.value.newPassword.length < 6) {
    passwordError.value = 'New password must be at least 6 characters.'
    return
  }
  
  // Validate current password
  if (passwordForm.value.currentPassword.length < 6) {
    passwordError.value = 'Current password must be at least 6 characters.'
    return
  }
  
  isChangingPassword.value = true
  
  try {
    // Debug - check auth state
    console.log('🔍 Auth state before password change:')
    console.log('  isAuthenticated:', authStore.isAuthenticated)
    console.log('  user:', authStore.user?.email)
    console.log('  token:', authStore.token ? 'Present' : 'Missing')
    
    const result = await authStore.changePassword(
      passwordForm.value.currentPassword,
      passwordForm.value.newPassword
    )
    
    console.log('✅ Password changed successfully:', result)
    
    passwordSuccess.value = 'Password changed successfully!'
    passwordError.value = ''
    
    // Clear the form
    passwordForm.value = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
    
    // Clear success message after 5 seconds
    setTimeout(() => {
      passwordSuccess.value = ''
    }, 5000)
    
  } catch (error) {
    console.error('❌ Password change failed:', error)
    passwordError.value = error || 'Failed to change password. Please try again.'
    passwordSuccess.value = ''
  } finally {
    isChangingPassword.value = false
  }
}

// Save preferences when changed
const savePreferences = () => {
  localStorage.setItem('soutou_preferences', JSON.stringify(preferences.value))
  console.log('💾 Preferences saved')
}

// Watch for preference changes
watch(preferences, savePreferences, { deep: true })
</script>