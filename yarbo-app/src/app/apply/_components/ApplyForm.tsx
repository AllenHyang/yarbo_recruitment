"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState, useEffect } from "react";
import { submitJobApplicationWithFile, getJobs, getUserResume, getUserResumes } from "@/lib/api";
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
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Send, Check, Upload, User, Mail, Phone, Briefcase, AlertCircle, FileText } from "lucide-react";

import { useToastActions } from "@/components/ui/toast";
import { sendApplicationEmail } from "@/lib/email-client";
import { useAuth } from "@/contexts/AuthContext";



const formSchema = z.object({
  name: z.string().min(2, "姓名至少需要2个字符"),
  email: z.string().email("请输入有效的邮箱地址"),
  phone: z.string().regex(/^1[3-9]\d{9}$/, "请输入有效的手机号码"),
  jobId: z.string().min(1, "请选择申请职位"),
  resumeId: z.string().min(1, "请选择要使用的简历"),
  coverLetter: z.string().optional(),
});

interface Job {
  id: string;
  title: string;
  department: string;
  status: string;
}

export function ApplyForm({
  positionTitle,
  positionDepartment,
  jobId
}: {
  positionTitle?: string;
  positionDepartment?: string;
  jobId?: string;
}) {
  const { user, userProfile } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isUsingFallback, setIsUsingFallback] = useState(false);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoadingJobs, setIsLoadingJobs] = useState(true);
  const [userResumes, setUserResumes] = useState<any[]>([]);
  const [selectedResume, setSelectedResume] = useState<any>(null);
  const [isLoadingResume, setIsLoadingResume] = useState(true);
  const toast = useToastActions();

  // 邮件通知Hook（临时禁用）
  // const { sendApplicationReceived, sendHRNotification } = useApplicationEmail();

  // 获取用户信息用于自动填充
  const getUserDisplayName = () => {
    if (userProfile?.profile?.first_name && userProfile?.profile?.last_name) {
      return `${userProfile.profile.first_name} ${userProfile.profile.last_name}`;
    }
    return user?.email?.split('@')[0] || "";
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: getUserDisplayName(),
      email: user?.email || "",
      phone: userProfile?.profile?.phone || "",
      jobId: jobId || "",
      resumeId: "",
      coverLetter: "",
    },
  });

  // 设置表单默认值（当有jobId时）
  useEffect(() => {
    if (jobId) {
      form.setValue('jobId', jobId);
    }
  }, [jobId, form]);

  // 当用户信息加载后，更新表单值
  useEffect(() => {
    if (user && userProfile) {
      const displayName = getUserDisplayName();
      const userEmail = user.email || "";
      const userPhone = userProfile.profile?.phone || "";

      // 只有当字段为空时才自动填充，避免覆盖用户已输入的内容
      if (!form.getValues('name') && displayName) {
        form.setValue('name', displayName);
      }
      if (!form.getValues('email') && userEmail) {
        form.setValue('email', userEmail);
      }
      if (!form.getValues('phone') && userPhone) {
        form.setValue('phone', userPhone);
      }
    }
  }, [user, userProfile, form]);

  // 优化的职位列表获取 - 添加缓存和重试机制
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setIsLoadingJobs(true);

        // 首先尝试获取缓存的数据
        const response = await fetch('/api/jobs?fields=id,title,department,status');
        if (response.ok) {
          const data = await response.json();
          const activeJobs = (data.jobs || []).filter((job: Job) => job.status === 'active');
          setJobs(activeJobs);
          console.log(`申请页面获取到 ${activeJobs.length} 个活跃职位`);
        } else {
          console.error('获取职位列表失败，状态码:', response.status);
          // 如果API失败，尝试使用基础数据
          const fallbackResponse = await fetch('/api/jobs');
          if (fallbackResponse.ok) {
            const fallbackData = await fallbackResponse.json();
            const activeJobs = (fallbackData.jobs || []).filter((job: Job) => job.status === 'active');
            setJobs(activeJobs);
          } else {
            setJobs([]);
          }
        }
      } catch (error) {
        console.error('获取职位列表错误:', error);
        // 最后的降级方案：使用静态数据
        const staticJobs = [
          { id: 'static-1', title: '软件工程师', department: '技术部', status: 'active' },
          { id: 'static-2', title: '产品经理', department: '产品部', status: 'active' },
          { id: 'static-3', title: '数据分析师', department: '数据部', status: 'active' }
        ];
        setJobs(staticJobs);
        console.log('使用静态职位数据作为降级方案');
      } finally {
        setIsLoadingJobs(false);
      }
    };

    fetchJobs();
  }, []);

  // 加载用户简历
  useEffect(() => {
    const loadResumes = async () => {
      if (!user?.id) {
        setIsLoadingResume(false);
        return;
      }

      try {
        setIsLoadingResume(true);
        const resumes = await getUserResumes(user.id);
        setUserResumes(resumes);

        // 自动选择主简历
        const primaryResume = resumes.find(r => r.is_primary) || resumes[0];
        if (primaryResume) {
          setSelectedResume(primaryResume);
          form.setValue('resumeId', primaryResume.id);
        }
      } catch (error) {
        console.error('加载用户简历失败:', error);
        setUserResumes([]);
        setSelectedResume(null);
      } finally {
        setIsLoadingResume(false);
      }
    };

    loadResumes();
  }, [user?.id, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    setSubmitError(null);
    setIsUsingFallback(false);

    try {
      const selectedJobId = values.jobId || jobId;
      if (selectedJobId) {
        // 检查用户是否已选择简历
        if (!selectedResume || !values.resumeId) {
          throw new Error('请选择要使用的简历');
        }

        console.log('开始提交申请，jobId:', selectedJobId);
        console.log('表单数据:', values);
        console.log('选择的简历:', selectedResume);

        // 调用新的API提交申请（使用已有简历）
        const response = await fetch('/api/applications/submit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            jobId: selectedJobId,
            applicantInfo: {
              name: values.name,
              email: values.email,
              phone: values.phone,
            },
            coverLetter: values.coverLetter || null,
            resumeId: values.resumeId,
            useExistingResume: true
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || '申请提交失败');
        }

        const result = await response.json();
        console.log('申请提交成功:', result);

        // 发送邮件通知
        try {
          // 生成申请编号
          const applicationId = result.data?.application?.id || `APP${Date.now()}`;

          // 获取选中的职位标题
          const selectedJob = jobs.find(job => job.id === selectedJobId);
          const positionTitle = selectedJob?.title || '未知职位';

          // 发送申请确认邮件给候选人
          const emailSent = await sendApplicationEmail(
            values.email,
            values.name,
            positionTitle,
            applicationId
          );

          if (emailSent) {
            toast.success("申请提交成功，账户已自动创建，确认邮件已发送");
          } else {
            toast.warning("申请提交成功，账户已自动创建，但邮件发送失败");
          }

          console.log('邮件通知处理完成');
        } catch (emailError) {
          console.warn('邮件发送失败，但申请已成功提交:', emailError);
          toast.warning("申请提交成功，账户已自动创建，但邮件发送失败");
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
              jobId: jobId || "",
              resumeId: "",
              coverLetter: "",
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
                  {user && <span className="text-xs text-gray-500">(已自动填充)</span>}
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="请输入您的姓名"
                    className={`h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500 ${user ? 'bg-gray-50' : ''
                      }`}
                    readOnly={!!user}
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
                  {user && <span className="text-xs text-gray-500">(已自动填充)</span>}
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="请输入您的邮箱"
                    className={`h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500 ${user ? 'bg-gray-50' : ''
                      }`}
                    readOnly={!!user}
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
                  {user && <span className="text-xs text-gray-500">(已自动填充)</span>}
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder={user ? (field.value || "请在个人设置中完善电话信息") : "请输入您的手机号码"}
                    className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500 bg-gray-50"
                    readOnly={!!user}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
                {user && !field.value && (
                  <p className="text-sm text-amber-600 mt-1">
                    请前往 <a href="/profile" className="underline text-blue-600 hover:text-blue-800">个人设置</a> 完善您的电话信息
                  </p>
                )}
              </FormItem>
            )}
          />

          {/* 职位选择 - 如果已有jobId则显示固定职位，否则显示选择器 */}
          {jobId && positionTitle ? (
            // 显示固定的职位信息（从职位详情页跳转过来）
            <FormItem>
              <FormLabel className="flex items-center space-x-2 text-gray-700 font-medium">
                <Briefcase className="h-4 w-4" />
                <span>申请职位</span>
              </FormLabel>
              <div className="h-11 px-3 py-2 border border-gray-200 rounded-md bg-gray-50 flex items-center">
                <div className="flex flex-col">
                  <span className="font-medium text-gray-900">{positionTitle}</span>
                  {positionDepartment && (
                    <span className="text-sm text-gray-500">{positionDepartment}</span>
                  )}
                </div>
              </div>
              <input type="hidden" name="jobId" value={jobId} />
            </FormItem>
          ) : (
            // 显示职位选择器（直接访问申请页面）
            <FormField
              control={form.control}
              name="jobId"
              render={({ field }: { field: any }) => (
                <FormItem>
                  <FormLabel className="flex items-center space-x-2 text-gray-700 font-medium">
                    <Briefcase className="h-4 w-4" />
                    <span>申请职位</span>
                  </FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value} disabled={isLoadingJobs}>
                      <SelectTrigger className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                        <SelectValue placeholder={isLoadingJobs ? "加载职位中..." : "请选择您要申请的职位"} />
                      </SelectTrigger>
                      <SelectContent>
                        {jobs.map((job) => (
                          <SelectItem key={job.id} value={job.id}>
                            <div className="flex flex-col">
                              <span className="font-medium">{job.title}</span>
                              <span className="text-sm text-gray-500">{job.department}</span>
                            </div>
                          </SelectItem>
                        ))}
                        {jobs.length === 0 && !isLoadingJobs && (
                          <SelectItem value="" disabled>
                            暂无可申请的职位
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>

        {/* 简历选择 */}
        <FormField
          control={form.control}
          name="resumeId"
          render={({ field }: { field: any }) => (
            <FormItem>
              <FormLabel className="flex items-center space-x-2 text-gray-700 font-medium">
                <FileText className="h-4 w-4" />
                <span>选择简历</span>
              </FormLabel>

              {isLoadingResume ? (
                <div className="flex items-center space-x-2 p-3 border border-gray-200 rounded-md bg-gray-50">
                  <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-gray-600">加载简历列表...</span>
                </div>
              ) : userResumes.length > 0 ? (
                <FormControl>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      const resume = userResumes.find(r => r.id === value);
                      setSelectedResume(resume);
                    }}
                    value={field.value}
                  >
                    <SelectTrigger className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                      <SelectValue placeholder="请选择要使用的简历" />
                    </SelectTrigger>
                    <SelectContent>
                      {userResumes.map((resume) => (
                        <SelectItem key={resume.id} value={resume.id}>
                          <div className="flex flex-col">
                            <div className="flex items-center space-x-2">
                              <span className="font-medium">{resume.filename}</span>
                              {resume.is_primary && (
                                <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                                  主简历
                                </span>
                              )}
                            </div>
                            <span className="text-sm text-gray-500">
                              上传时间: {new Date(resume.uploaded_at).toLocaleDateString()}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
              ) : (
                <div className="p-3 border border-amber-200 rounded-md bg-amber-50">
                  <div className="flex items-center space-x-2 mb-2">
                    <AlertCircle className="h-5 w-5 text-amber-600" />
                    <p className="text-amber-800 font-medium">未上传简历</p>
                  </div>
                  <p className="text-amber-700 text-sm mb-2">
                    申请职位前需要先上传简历到个人设置中
                  </p>
                  <a
                    href="/profile"
                    className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    前往个人设置上传简历 →
                  </a>
                </div>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 求职信字段 */}
        <FormField
          control={form.control}
          name="coverLetter"
          render={({ field }: { field: any }) => (
            <FormItem>
              <FormLabel className="flex items-center space-x-2 text-gray-700 font-medium">
                <FileText className="h-4 w-4" />
                <span>求职信</span>
                <span className="text-xs text-gray-500">(可选)</span>
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder="请输入您的求职信，介绍您申请此职位的原因和优势..."
                  className="min-h-[120px] border-gray-200 focus:border-blue-500 focus:ring-blue-500 resize-none"
                  disabled={isSubmitting}
                  {...field}
                />
              </FormControl>
              <FormDescription className="text-gray-500 text-sm">
                求职信可以帮助HR更好地了解您的申请动机和个人优势，建议控制在200字以内。
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="pt-4">
          <Button
            type="submit"
            disabled={isSubmitting || userResumes.length === 0 || !selectedResume || isLoadingResume}
            className="w-full h-12 bg-gray-900 hover:bg-gray-800 text-white transition-all duration-300 hover:scale-105 shadow-md hover:shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isSubmitting ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>提交中...</span>
              </div>
            ) : userResumes.length === 0 ? (
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-4 w-4" />
                <span>请先上传简历</span>
              </div>
            ) : !selectedResume ? (
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-4 w-4" />
                <span>请选择简历</span>
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