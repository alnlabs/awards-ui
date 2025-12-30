import { Controller } from "react-hook-form";

const SecurityQuestions = ({
  control,
  register,
  watch,
  errors,
  questionOptions, // ✅ explicit
  count = 3, // ✅ default
}) => {
  const watched = watch("security_questions");

  return (
    <>
      <h5>Security Questions</h5>

      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="border rounded p-3 mb-3">
          {/* QUESTION */}
          <Controller
            name={`security_questions.${index}.question`}
            control={control}
            rules={{ required: "Question is required" }}
            render={({ field }) => (
              <select
                className="form-select mb-2"
                value={field.value || ""}
                onChange={(e) => field.onChange(e.target.value)}
              >
                <option value="">Select a question</option>

                {questionOptions.map((q) => {
                  const used = watched
                    ?.map((sq, i) => i !== index && sq?.question)
                    .includes(q);

                  return (
                    <option key={q} value={q} disabled={used}>
                      {q}
                    </option>
                  );
                })}
              </select>
            )}
          />

          {errors?.security_questions?.[index]?.question && (
            <small className="text-danger">
              {errors.security_questions[index].question.message}
            </small>
          )}

          {/* ANSWER */}
          <input
            className="form-control mt-2"
            placeholder="Answer"
            autoComplete="off"
            {...register(`security_questions.${index}.answer`, {
              required: "Answer is required",
              minLength: { value: 3, message: "Min 3 characters" },
            })}
          />

          {errors?.security_questions?.[index]?.answer && (
            <small className="text-danger">
              {errors.security_questions[index].answer.message}
            </small>
          )}
        </div>
      ))}
    </>
  );
};

export default SecurityQuestions;
