"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState } from "react";
import { submitJobApplicationWithFile } from "@/lib/api";
// import { useApplicationEmail } from "@/hooks/useEmailNotification"; // 临时注释以解决编译问题

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Send, Check, Upload, User, Mail, Phone, Briefcase, AlertCircle } from "lucide-react";
import { EnhancedFileUpload } from "@/components/ui/enhanced-file-upload";
import { useToastActions } from "@/components/ui/toast";
import { sendApplicationEmail } from "@/app/api/email/route";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_FILE_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
];

const formSchema = z.object({
  name: z.string().min(2, "姓名至少需要2个字符"),
  email: z.string().email("请输入有效的邮箱地址"),
  phone: z.string().regex(/^1[3-9]\d{9}$/, "请输入有效的手机号码"),
  position: z.string().min(1, "申请职位不能为空"),
  resume: z
    .any()
    .refine((files) => files?.length == 1, "请上传您的简历")
    .refine(
      (files) => files?.[0]?.size <= MAX_FILE_SIZE,
      `文件大小不能超过 5MB.`
    )
    .refine(
      (files) => ACCEPTED_FILE_TYPES.includes(files?.[0]?.type),
      "支持 PDF、DOC、DOCX 格式的简历."
    ),
});

export function ApplyForm({
  positionTitle,
  jobId
}: {
  positionTitle?: string;
  jobId?: string;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isUsingFallback, setIsUsingFallback] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const toast = useToastActions();

  // 邮件通知Hook（临时禁用）
  // const { sendApplicationReceived, sendHRNotification } = useApplicationEmail();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      position: positionTitle || "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    setSubmitError(null);
    setIsUsingFallback(false);

    try {
      if (jobId) {
        // 尝试真实的数据库提交
        const result = await submitJobApplicationWithFile(
          jobId,
          {
            name: values.name,
            email: values.email,
            phone: values.phone,
          },
          uploadedFiles[0] || values.resume?.[0]
        );

        console.log('申请提交成功:', result);

        // 发送邮件通知
        try {
          // 生成申请编号
          const applicationId = result.application.id || `APP${Date.now()}`;

          // 发送申请确认邮件给候选人
          const emailSent = await sendApplicationEmail(
            values.email,
            values.name,
            values.position,
            applicationId
          );

          if (emailSent) {
            toast.success("申请提交成功，确认邮件已发送");
          } else {
            toast.warning("申请提交成功，但邮件发送失败");
          }

          console.log('邮件通知处理完成');
        } catch (emailError) {
          console.warn('邮件发送失败，但申请已成功提交:', emailError);
          toast.warning("申请提交成功，但邮件发送失败");
        }

        setIsSubmitted(true);
      } else {
        // 如果没有jobId，使用模拟提交
        setIsUsingFallback(true);
        await new Promise(resolve => setTimeout(resolve, 2000));
        console.log('模拟提交:', values);
        setIsSubmitted(true);
      }
    } catch (error) {
      console.error('申请提交失败:', error);

      // 如果数据库提交失败，显示错误但允许用户查看"成功"状态
      if (error instanceof Error) {
        setSubmitError(error.message);
      } else {
        setSubmitError('提交过程中遇到技术问题，请稍后重试或直接联系HR部门');
      }

      // 仍然显示成功页面，但带有错误提示
      setIsUsingFallback(true);
      setIsSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isSubmitted) {
    return (
      <div className="text-center py-12 space-y-6">
        <div className={`w-16 h-16 rounded-full ${submitError ? 'bg-yellow-100' : 'bg-green-100'} flex items-center justify-center mx-auto`}>
          {submitError ? (
            <AlertCircle className="h-8 w-8 text-yellow-600" />
          ) : (
            <Check className="h-8 w-8 text-green-600" />
          )}
        </div>
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {submitError ? '申请已收到' : '申请提交成功！'}
          </h3>
          <p className="text-gray-600 leading-relaxed">
            {submitError ? (
              <>
                我们已收到您的申请信息。由于系统暂时繁忙，请您也可以直接发送简历到 hr@yarbo.com，我们会尽快与您联系。
              </>
            ) : isUsingFallback ? (
              <>
                感谢您的申请。由于您通过静态页面提交，请将简历发送至 hr@yarbo.com，我们将在3个工作日内与您联系。
              </>
            ) : (
              <>
                感谢您的申请。我们已收到您的简历，将在3个工作日内与您联系。
              </>
            )}
          </p>
          {submitError && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-700">
                技术细节：{submitError}
              </p>
            </div>
          )}
        </div>
        <Button
          onClick={() => {
            setIsSubmitted(false);
            setSubmitError(null);
            form.reset({
              name: "",
              email: "",
              phone: "",
              position: positionTitle || "",
            });
          }}
          variant="outline"
          className="mt-4"
        >
          提交新申请
        </Button>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }: { field: any }) => (
              <FormItem>
                <FormLabel className="flex items-center space-x-2 text-gray-700 font-medium">
                  <User className="h-4 w-4" />
                  <span>姓名</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="请输入您的姓名"
                    className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }: { field: any }) => (
              <FormItem>
                <FormLabel className="flex items-center space-x-2 text-gray-700 font-medium">
                  <Mail className="h-4 w-4" />
                  <span>邮箱</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="请输入您的邮箱"
                    className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="phone"
            render={({ field }: { field: any }) => (
              <FormItem>
                <FormLabel className="flex items-center space-x-2 text-gray-700 font-medium">
                  <Phone className="h-4 w-4" />
                  <span>电话</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="请输入您的手机号码"
                    className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="position"
            render={({ field }: { field: any }) => (
              <FormItem>
                <FormLabel className="flex items-center space-x-2 text-gray-700 font-medium">
                  <Briefcase className="h-4 w-4" />
                  <span>申请职位</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="请输入您要申请的职位"
                    className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="resume"
          render={({ field }: { field: any }) => (
            <FormItem>
              <FormLabel className="flex items-center space-x-2 text-gray-700 font-medium">
                <Upload className="h-4 w-4" />
                <span>简历</span>
              </FormLabel>
              <FormControl>
                <EnhancedFileUpload
                  onFilesChange={(files) => {
                    setUploadedFiles(files);
                    field.onChange(files);
                    if (files.length > 0) {
                      toast.success("文件上传成功");
                    }
                  }}
                  maxFiles={1}
                  maxSize={MAX_FILE_SIZE}
                  acceptedTypes={ACCEPTED_FILE_TYPES}
                  multiple={false}
                  showPreview={true}
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormDescription className="text-gray-500 text-sm">
                请上传 PDF、DOC 或 DOCX 格式的简历，大小不超过 5MB。支持拖拽上传。
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="pt-4">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-12 bg-gray-900 hover:bg-gray-800 text-white transition-all duration-300 hover:scale-105 shadow-md hover:shadow-lg"
          >
            {isSubmitting ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>提交中...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Send className="h-4 w-4" />
                <span>提交申请</span>
              </div>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
} 