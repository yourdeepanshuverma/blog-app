import React, { useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { Button, Input, Select } from "../index";
import service from "../../appwrite/config";
import { useSelector } from "react-redux";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function postForm({ post }) {
  const navigate = useNavigate();
  const userData = useSelector((state) => state.auth.userData);

  const { register, setValue, getValues, control, watch, handleSubmit } =
    useForm({
      defaultValues: {
        title: post?.title || "",
        slug: post?.slug || "",
        description: post?.description || "",
        status: post?.status || "active",
      },
    });

  const submit = async (data) => {
    if (post) {
      const uploadFile = data.image[0]
        ? await service.uploadFile(data.image[0])
        : null;

      if (uploadFile && updateFile !== post.image) {
        await service.deleteFile(post.$id);
      }
      const updateFile = await service.updatePost(post.$id, {
        ...data,
        image: uploadFile ? uploadFile.$id : undefined,
      });
      if (updateFile) {
        navigate(`/post/${post.$id}`);
      }
    } else {
      const uploadFile = data.image[0]
        ? await service.uploadFile(data.image[0])
        : null;
      if (uploadFile) {
        data.image = uploadFile.$id;
        const createPost = await service.createPost({
          ...data,
          userId: userData.$id,
        });
        if (createPost) {
          navigate(`/post/${createPost.$id}`);
        }
      }
    }
  };

  const slugTransform = useCallback((value) => {
    if (value && typeof value === "string")
      return value.trim().toLowerCase().replace(/\s/g, "-");
  });

  useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name === "title") {
        setValue("slug", slugTransform(value.title), { shouldValidate: true });
      }

      return () => subscription.unsubscribe();
    });
  }, [watch, slugTransform, setValue]);

  return (
    <form onSubmit={handleSubmit(submit)} className="flex flex-wrap">
      <div className="w-2/3 px-2">
        <Input
          label="Title :"
          placeholder="Title"
          className="mb-4"
          {...register("title", { required: true })}
        />
        <Input
          label="Slug :"
          placeholder="Slug"
          className="mb-4"
          {...register("slug", { required: true })}
          onInput={(e) => {
            setValue("slug", slugTransform(e.currentTarget.value), {
              shouldValidate: true,
            });
          }}
        />
        <RTE
          label="Description"
          name="description"
          control={control}
          defaultValue={getValues("description")}
        />
      </div>
      <div className="w-1/3 px-2">
        <Input
          label="Image :"
          type="file"
          className="mb-4"
          accept="image/png, image/jpg, image/jpeg, image/gif"
          {...register("image", { required: !post })}
        />
        {post && (
          <div className="w-full mb-4">
            <img
              src={appwriteService.getFilePreview(post.image)}
              alt={post.title}
              className="rounded-lg"
            />
          </div>
        )}
        <Select
          options={["active", "inactive"]}
          label="Status"
          className="mb-4"
          {...register("status", { required: true })}
        />
        <Button
          type="submit"
          bgColor={post ? "bg-green-500" : undefined}
          className="w-full"
        >
          {post ? "Update" : "Submit"}
        </Button>
      </div>
    </form>
  );
}

export default postForm;
