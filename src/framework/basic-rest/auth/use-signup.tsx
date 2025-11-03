import { useUI } from '@contexts/ui.context';
import Cookies from 'js-cookie';
import { useMutation } from '@tanstack/react-query';

export interface SignUpInputType {
  email: string;
  password: string;
  username: string;
  phone_number: string | undefined; // Add phone field
  remember_me: boolean;
}

async function signUp(input: SignUpInputType) {
  return {
    token: `${input.email}.${input.username}`.split('').reverse().join(''),
  };
}
export const useSignUpMutation = () => {
  const { authorize, closeModal } = useUI();
  return useMutation({
    mutationFn: (input: SignUpInputType) => signUp(input),
    onSuccess: (data) => {
      Cookies.set('auth_token', data.token);
      authorize();
      closeModal();
    },
    onError: (data) => {
      console.log(data, 'login error response');
    },
  });
};
