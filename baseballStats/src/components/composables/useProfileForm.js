import { ref } from 'vue'
import { useAuth, friendlyError } from './useAuth'
import { shrinkImage } from './image'

export const BIO_MAX = 200

// The "edit my profile" form: picture, name and bio
export function useProfileForm() {
    const { profile, updateMyProfile } = useAuth()

    const name = ref(profile.value?.displayName ?? '')
    const bio = ref(profile.value?.bio ?? '')
    const photo = ref(profile.value?.photoURL ?? '')
    const saving = ref(false)
    const message = ref('')
    const error = ref('')

    async function pickPhoto(event) {
        const file = event.target.files[0]
        event.target.value = ''
        if (!file) return
        error.value = ''
        try {
            photo.value = await shrinkImage(file)
        } catch (err) {
            error.value = err.message
        }
    }

    async function save() {
        saving.value = true
        message.value = ''
        error.value = ''
        try {
            await updateMyProfile({ displayName: name.value.trim(), bio: bio.value.trim(), photoURL: photo.value })
            message.value = 'Profile saved.'
        } catch (err) {
            error.value = friendlyError(err)
        } finally {
            saving.value = false
        }
    }

    return { name, bio, photo, saving, message, error, pickPhoto, save }
}

// The "change password" form
export function usePasswordForm() {
    const { changePassword } = useAuth()

    const current = ref('')
    const next = ref('')
    const confirm = ref('')
    const saving = ref(false)
    const message = ref('')
    const error = ref('')

    async function save() {
        message.value = ''
        error.value = ''
        if (next.value !== confirm.value) {
            error.value = 'The new passwords do not match.'
            return
        }
        saving.value = true
        try {
            await changePassword(current.value, next.value)
            current.value = next.value = confirm.value = ''
            message.value = 'Password changed.'
        } catch (err) {
            error.value = err.code === 'auth/invalid-credential' ? 'Current password is wrong.' : friendlyError(err)
        } finally {
            saving.value = false
        }
    }

    return { current, next, confirm, saving, message, error, save }
}
