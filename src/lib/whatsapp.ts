

export function normalizeBRPhoneToE164(phone: string){
    const digits = phone.replace(/\D/g, '');
    return digits.startsWith('55') ? digits : `55${digits}`
}