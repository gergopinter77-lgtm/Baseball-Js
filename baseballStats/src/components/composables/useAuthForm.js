import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth, friendlyError, redirectPath } from './useAuth'

// Login and register forms: on success, go back to where the user came from
export function useAuthForm() {
    const route = useRoute()
    const router = useRouter()
    const { login, register } = useAuth()

    const name = ref('')
    const email = ref('')
    const password = ref('')
    const error = ref('')
    const loading = ref(false)

    async function run(action) {
        error.value = ''
        loading.value = true
        try {
            await action()
            router.push(redirectPath(route.query))
        } catch (err) {
            error.value = friendlyError(err)
        } finally {
            loading.value = false
        }
    }

    const submitLogin = () => run(() => login(email.value, password.value))
    const submitRegister = () => run(() => register(email.value, password.value, name.value.trim()))

    return { name, email, password, error, loading, submitLogin, submitRegister }
}
