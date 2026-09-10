import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Modal,
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import { Eye, EyeOff, Mail, Lock, Car, X, Send } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { AnimatedPressable } from '@/components/AnimatedPressable';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/utils/api';

// ─── helpers ────────────────────────────────────────────────────────────────

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ─── forgot-password sheet ───────────────────────────────────────────────────

interface ForgotPasswordSheetProps {
  visible: boolean;
  onClose: () => void;
}

function ForgotPasswordSheet({ visible, onClose }: ForgotPasswordSheetProps) {
  const COLORS = useColors();
  const insets = useSafeAreaInsets();
  const [resetEmail, setResetEmail] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [sheetError, setSheetError] = useState('');

  const slideAnim = useRef(new Animated.Value(300)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      setSent(false);
      setSheetError('');
      setResetEmail('');
      Animated.parallel([
        Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, bounciness: 4, speed: 14 }),
        Animated.timing(backdropAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, { toValue: 300, duration: 220, useNativeDriver: true }),
        Animated.timing(backdropAnim, { toValue: 0, duration: 220, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  async function handleSendReset() {
    console.log('[Login] Forgot password: send reset link for:', resetEmail);
    if (!resetEmail.trim()) {
      setSheetError('Please enter your email address.');
      return;
    }
    if (!validateEmail(resetEmail)) {
      setSheetError('Enter a valid email address.');
      return;
    }
    setSheetError('');
    setIsSending(true);
    try {
      await api.post('/api/auth/forgot-password', { email: resetEmail.trim() });
      console.log('[Login] Forgot password: reset link sent successfully');
      setSent(true);
    } catch (e: unknown) {
      console.error('[Login] Forgot password: request failed:', e);
      const msg =
        (e as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Something went wrong. Please try again.';
      setSheetError(msg);
    } finally {
      setIsSending(false);
    }
  }

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
      {/* Backdrop */}
      <Animated.View
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.5)',
          opacity: backdropAnim,
          justifyContent: 'flex-end',
        }}
      >
        <AnimatedPressable
          onPress={onClose}
          style={{ flex: 1 }}
          accessibilityLabel="Close"
        />

        {/* Sheet */}
        <Animated.View
          style={{
            backgroundColor: COLORS.surface,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            paddingHorizontal: 24,
            paddingTop: 20,
            paddingBottom: insets.bottom + 24,
            gap: 20,
            transform: [{ translateY: slideAnim }],
          }}
        >
          {/* Handle + header */}
          <View style={{ alignItems: 'center' }}>
            <View
              style={{
                width: 36,
                height: 4,
                borderRadius: 2,
                backgroundColor: COLORS.border,
                marginBottom: 16,
              }}
            />
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text
              style={{
                fontSize: 18,
                fontWeight: '700',
                color: COLORS.text,
                fontFamily: 'SpaceGrotesk-Bold',
              }}
            >
              Reset password
            </Text>
            <AnimatedPressable
              onPress={onClose}
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                backgroundColor: COLORS.surfaceSecondary,
                alignItems: 'center',
                justifyContent: 'center',
              }}
              accessibilityLabel="Close"
            >
              <X size={16} color={COLORS.textSecondary} />
            </AnimatedPressable>
          </View>

          {sent ? (
            <View
              style={{
                backgroundColor: COLORS.successMuted,
                borderRadius: 12,
                padding: 16,
                borderWidth: 1,
                borderColor: COLORS.success + '40',
                gap: 6,
              }}
            >
              <Text
                style={{
                  fontSize: 15,
                  fontWeight: '600',
                  color: COLORS.success,
                  fontFamily: 'SpaceGrotesk-SemiBold',
                }}
              >
                Check your inbox
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  color: COLORS.success,
                  fontFamily: 'SpaceGrotesk-Regular',
                  opacity: 0.85,
                }}
              >
                We sent a reset link to {resetEmail}
              </Text>
            </View>
          ) : (
            <>
              <Text
                style={{
                  fontSize: 14,
                  color: COLORS.textSecondary,
                  fontFamily: 'SpaceGrotesk-Regular',
                  lineHeight: 20,
                }}
              >
                Enter your account email and we'll send you a link to reset your password.
              </Text>

              {sheetError ? (
                <View
                  style={{
                    backgroundColor: COLORS.dangerMuted,
                    borderRadius: 10,
                    padding: 12,
                    borderWidth: 1,
                    borderColor: COLORS.danger + '40',
                  }}
                >
                  <Text
                    style={{
                      fontSize: 13,
                      color: COLORS.danger,
                      fontFamily: 'SpaceGrotesk-Regular',
                    }}
                  >
                    {sheetError}
                  </Text>
                </View>
              ) : null}

              {/* Email input */}
              <View style={{ gap: 6 }}>
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: '600',
                    color: COLORS.textSecondary,
                    fontFamily: 'SpaceGrotesk-SemiBold',
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                  }}
                >
                  Email
                </Text>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: COLORS.surfaceSecondary,
                    borderRadius: 10,
                    borderWidth: 1.5,
                    borderColor: COLORS.border,
                    paddingHorizontal: 14,
                    gap: 10,
                  }}
                >
                  <Mail size={18} color={COLORS.textSecondary} />
                  <TextInput
                    value={resetEmail}
                    onChangeText={setResetEmail}
                    placeholder="you@example.com"
                    placeholderTextColor={COLORS.textTertiary}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    returnKeyType="send"
                    onSubmitEditing={handleSendReset}
                    style={{
                      flex: 1,
                      fontSize: 15,
                      color: COLORS.text,
                      paddingVertical: 14,
                      fontFamily: 'SpaceGrotesk-Regular',
                    }}
                  />
                </View>
              </View>

              <AnimatedPressable
                onPress={handleSendReset}
                disabled={isSending}
                style={{
                  backgroundColor: COLORS.primary,
                  borderRadius: 12,
                  paddingVertical: 15,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  opacity: isSending ? 0.7 : 1,
                }}
                accessibilityLabel="Send reset link"
                accessibilityRole="button"
              >
                <Send size={16} color="#FFFFFF" />
                <Text
                  style={{
                    fontSize: 15,
                    fontWeight: '700',
                    color: '#FFFFFF',
                    fontFamily: 'SpaceGrotesk-Bold',
                  }}
                >
                  {isSending ? 'Sending…' : 'Send reset link'}
                </Text>
              </AnimatedPressable>
            </>
          )}
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

// ─── main screen ────────────────────────────────────────────────────────────

export default function LoginScreen() {
  const COLORS = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [serverError, setServerError] = useState('');
  const [forgotVisible, setForgotVisible] = useState(false);

  const passwordRef = useRef<TextInput>(null);

  // Entrance animations
  const anims = useRef(
    Array.from({ length: 5 }, () => ({
      opacity: new Animated.Value(0),
      translateY: new Animated.Value(12),
    }))
  ).current;

  // Button pulse
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const pulseLoop = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    const animations = anims.map((anim, i) =>
      Animated.parallel([
        Animated.timing(anim.opacity, {
          toValue: 1,
          duration: 280,
          delay: i * 60,
          useNativeDriver: true,
        }),
        Animated.timing(anim.translateY, {
          toValue: 0,
          duration: 280,
          delay: i * 60,
          useNativeDriver: true,
        }),
      ])
    );
    Animated.stagger(60, animations).start();
  }, []);

  useEffect(() => {
    if (isLoading) {
      pulseLoop.current = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 0.65, duration: 600, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        ])
      );
      pulseLoop.current.start();
    } else {
      pulseLoop.current?.stop();
      Animated.timing(pulseAnim, { toValue: 1, duration: 200, useNativeDriver: true }).start();
    }
  }, [isLoading]);

  // ── per-field validation ──────────────────────────────────────────────────

  const validateField = useCallback(
    (field: string, values?: { email: string; password: string }) => {
      const v = values ?? { email, password };
      const newErrors = { ...errors };

      if (field === 'email') {
        if (!v.email.trim()) newErrors.email = 'Email is required';
        else if (!validateEmail(v.email)) newErrors.email = 'Enter a valid email address';
        else delete newErrors.email;
      }
      if (field === 'password') {
        if (!v.password.trim()) newErrors.password = 'Password is required';
        else delete newErrors.password;
      }

      setErrors(newErrors);
    },
    [errors, email, password]
  );

  function handleBlur(field: string) {
    console.log(`[Login] Field blurred: ${field}`);
    setTouched((prev) => ({ ...prev, [field]: true }));
    validateField(field);
  }

  function handleEmailChange(v: string) {
    setEmail(v);
    if (touched.email) validateField('email', { email: v, password });
  }
  function handlePasswordChange(v: string) {
    setPassword(v);
    if (touched.password) validateField('password', { email, password: v });
  }

  function validateAll(): boolean {
    const newErrors: Record<string, string> = {};
    if (!email.trim()) newErrors.email = 'Email is required';
    else if (!validateEmail(email)) newErrors.email = 'Enter a valid email address';
    if (!password.trim()) newErrors.password = 'Password is required';
    setErrors(newErrors);
    setTouched({ email: true, password: true });
    return Object.keys(newErrors).length === 0;
  }

  async function handleLogin() {
    console.log('[Login] Sign in pressed for:', email);
    if (!validateAll()) {
      console.log('[Login] Validation failed');
      return;
    }
    setServerError('');
    setIsLoading(true);
    try {
      await login(email.trim(), password);
      console.log('[Login] Login successful, navigating to tabs');
      router.replace('/(tabs)/(home)');
    } catch (e: unknown) {
      console.error('[Login] Login failed:', e);
      const msg =
        (e as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Wrong email or password. Please try again.';
      setServerError(msg);
    } finally {
      setIsLoading(false);
    }
  }

  function animStyle(index: number) {
    return {
      opacity: anims[index].opacity,
      transform: [{ translateY: anims[index].translateY }],
    };
  }

  const emailBorderColor = errors.email ? COLORS.danger : COLORS.border;
  const passwordBorderColor = errors.password ? COLORS.danger : COLORS.border;

  return (
    <>
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: COLORS.background }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            paddingTop: insets.top,
            paddingBottom: insets.bottom + 24,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Hero header */}
          <Animated.View
            style={[
              {
                backgroundColor: COLORS.primary,
                paddingHorizontal: 24,
                paddingTop: 48,
                paddingBottom: 40,
                gap: 16,
              },
              animStyle(0),
            ]}
          >
            <View
              style={{
                width: 56,
                height: 56,
                borderRadius: 16,
                backgroundColor: 'rgba(255,255,255,0.15)',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Car size={28} color="#FFFFFF" />
            </View>
            <View style={{ gap: 6 }}>
              <Text
                style={{
                  fontSize: 28,
                  fontWeight: '800',
                  color: '#FFFFFF',
                  fontFamily: 'SpaceGrotesk-Bold',
                  letterSpacing: -0.5,
                }}
              >
                Family Car Planner
              </Text>
              <Text
                style={{
                  fontSize: 15,
                  color: 'rgba(255,255,255,0.75)',
                  fontFamily: 'SpaceGrotesk-Regular',
                }}
              >
                Sign in to manage your Kia e-Niro
              </Text>
            </View>
          </Animated.View>

          {/* Form */}
          <View style={{ padding: 24, gap: 20 }}>
            {/* Server error */}
            {serverError ? (
              <View
                style={{
                  backgroundColor: COLORS.dangerMuted,
                  borderRadius: 10,
                  padding: 12,
                  borderWidth: 1,
                  borderColor: COLORS.danger + '40',
                }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    color: COLORS.danger,
                    fontFamily: 'SpaceGrotesk-Regular',
                  }}
                >
                  {serverError}
                </Text>
              </View>
            ) : null}

            {/* Email */}
            <Animated.View style={[{ gap: 6 }, animStyle(1)]}>
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: '600',
                  color: COLORS.textSecondary,
                  fontFamily: 'SpaceGrotesk-SemiBold',
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                }}
              >
                Email
              </Text>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: COLORS.surfaceSecondary,
                  borderRadius: 10,
                  borderWidth: 1.5,
                  borderColor: emailBorderColor,
                  paddingHorizontal: 14,
                  gap: 10,
                  opacity: isLoading ? 0.5 : 1,
                }}
              >
                <Mail size={18} color={COLORS.textSecondary} />
                <TextInput
                  value={email}
                  onChangeText={handleEmailChange}
                  placeholder="you@example.com"
                  placeholderTextColor={COLORS.textTertiary}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoFocus
                  returnKeyType="next"
                  onSubmitEditing={() => passwordRef.current?.focus()}
                  onBlur={() => handleBlur('email')}
                  editable={!isLoading}
                  style={{
                    flex: 1,
                    fontSize: 15,
                    color: COLORS.text,
                    paddingVertical: 14,
                    fontFamily: 'SpaceGrotesk-Regular',
                  }}
                />
              </View>
              {errors.email ? (
                <Text
                  style={{
                    fontSize: 12,
                    color: COLORS.danger,
                    fontFamily: 'SpaceGrotesk-Regular',
                  }}
                >
                  {errors.email}
                </Text>
              ) : null}
            </Animated.View>

            {/* Password */}
            <Animated.View style={[{ gap: 6 }, animStyle(2)]}>
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: '600',
                  color: COLORS.textSecondary,
                  fontFamily: 'SpaceGrotesk-SemiBold',
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                }}
              >
                Password
              </Text>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: COLORS.surfaceSecondary,
                  borderRadius: 10,
                  borderWidth: 1.5,
                  borderColor: passwordBorderColor,
                  paddingHorizontal: 14,
                  gap: 10,
                  opacity: isLoading ? 0.5 : 1,
                }}
              >
                <Lock size={18} color={COLORS.textSecondary} />
                <TextInput
                  ref={passwordRef}
                  value={password}
                  onChangeText={handlePasswordChange}
                  placeholder="••••••••"
                  placeholderTextColor={COLORS.textTertiary}
                  secureTextEntry={!showPassword}
                  returnKeyType="done"
                  onSubmitEditing={handleLogin}
                  onBlur={() => handleBlur('password')}
                  editable={!isLoading}
                  style={{
                    flex: 1,
                    fontSize: 15,
                    color: COLORS.text,
                    paddingVertical: 14,
                    fontFamily: 'SpaceGrotesk-Regular',
                  }}
                />
                <AnimatedPressable
                  onPress={() => {
                    console.log('[Login] Toggle password visibility');
                    setShowPassword((v) => !v);
                  }}
                  style={{ padding: 4 }}
                  accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff size={18} color={COLORS.textSecondary} />
                  ) : (
                    <Eye size={18} color={COLORS.textSecondary} />
                  )}
                </AnimatedPressable>
              </View>
              {errors.password ? (
                <Text
                  style={{
                    fontSize: 12,
                    color: COLORS.danger,
                    fontFamily: 'SpaceGrotesk-Regular',
                  }}
                >
                  {errors.password}
                </Text>
              ) : null}

              {/* Forgot password link */}
              <AnimatedPressable
                onPress={() => {
                  console.log('[Login] Forgot password tapped');
                  setForgotVisible(true);
                }}
                style={{ alignSelf: 'flex-end', paddingVertical: 2 }}
                accessibilityLabel="Forgot password"
                accessibilityRole="button"
              >
                <Text
                  style={{
                    fontSize: 13,
                    color: COLORS.primary,
                    fontFamily: 'SpaceGrotesk-SemiBold',
                    fontWeight: '600',
                  }}
                >
                  Forgot password?
                </Text>
              </AnimatedPressable>
            </Animated.View>

            {/* Sign in button */}
            <Animated.View style={[animStyle(3), { opacity: pulseAnim }]}>
              <AnimatedPressable
                onPress={handleLogin}
                disabled={isLoading}
                style={{
                  backgroundColor: COLORS.primary,
                  borderRadius: 12,
                  paddingVertical: 16,
                  alignItems: 'center',
                  marginTop: 4,
                }}
                accessibilityLabel="Sign in"
                accessibilityRole="button"
              >
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: '700',
                    color: '#FFFFFF',
                    fontFamily: 'SpaceGrotesk-Bold',
                  }}
                >
                  {isLoading ? 'Signing in…' : 'Sign in'}
                </Text>
              </AnimatedPressable>
            </Animated.View>

            {/* Register link */}
            <Animated.View
              style={[
                { flexDirection: 'row', justifyContent: 'center', gap: 4, marginTop: 8 },
                animStyle(4),
              ]}
            >
              <Text
                style={{
                  fontSize: 14,
                  color: COLORS.textSecondary,
                  fontFamily: 'SpaceGrotesk-Regular',
                }}
              >
                New to the family?
              </Text>
              <Link href="/(auth)/register" asChild>
                <AnimatedPressable onPress={() => console.log('[Login] Navigate to register')}>
                  <Text
                    style={{
                      fontSize: 14,
                      color: COLORS.primary,
                      fontWeight: '600',
                      fontFamily: 'SpaceGrotesk-SemiBold',
                    }}
                  >
                    Create account
                  </Text>
                </AnimatedPressable>
              </Link>
            </Animated.View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <ForgotPasswordSheet visible={forgotVisible} onClose={() => setForgotVisible(false)} />
    </>
  );
}
